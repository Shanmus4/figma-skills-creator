// Token Collections Importer — code.js
// Runs in the Figma plugin sandbox. Has access to figma.* API but no DOM.

const COLLECTION_ORDER = [
  'Primitives', 'Theme', 'Semantic', 'Responsive',
  'Density', 'Layout', 'Effects', 'Typography',
  'Component Colors', 'Component Dimensions'
]

const MODE_ORDER = {
  'Theme':     ['light', 'dark'],
  'Responsive':['mobile', 'tablet', 'desktop'],
  'Density':   ['comfortable', 'compact', 'spacious'],
  'Layout':    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
}

figma.showUI(__html__, { width: 420, height: 600, themeColors: true })

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'CHECK_CONFLICTS': await checkConflicts(msg.collections); break
    case 'IMPORT':          await handleImport(msg.collections, msg.strategy); break
    case 'EXPORT':          await handleExport(); break
    case 'GET_COLLECTIONS': sendCollectionsList(); break
  }
}

// ─── CONFLICT DETECTION ───────────────────────────────────────────────────────

async function checkConflicts(collections) {
  const localCollections = figma.variables.getLocalVariableCollections()
  const localVars = figma.variables.getLocalVariables()
  const varNameById = {}
  const varCollById = {}
  
  // Build lookup maps for all local variables
  for (const coll of localCollections) {
    for (const vid of coll.variableIds) {
      const v = localVars.find(lv => lv.id === vid)
      if (v) {
        varNameById[vid] = v.name
        varCollById[vid] = coll.name
      }
    }
  }
  
  const analysis = collections.map(collData => {
    const existing = localCollections.find(c => c.name === collData.name)
    if (!existing) {
      return { name: collData.name, status: 'NEW', newCount: collData.tokenCount, changedCount: 0, sameCount: 0 }
    }
    
    let newCount = 0, changedCount = 0, sameCount = 0, removedCount = 0
    const existingVars = localVars.filter(v => v.variableCollectionId === existing.id)
    
    // Normalize both sets for reliable comparison
    const existingVarsByName = {}
    existingVars.forEach(v => {
      const normName = v.name.trim()
      existingVarsByName[normName] = v
    })

    const allIncomingPaths = new Set()
    collData.modes.forEach(m => Object.keys(m.tokens).forEach(p => {
      if (p && p.trim()) allIncomingPaths.add(p.trim())
    }))

    const localModeNames = existing.modes.map(m => m.name.toLowerCase())
    const incomingModeNames = collData.modes.map(m => m.modeName.toLowerCase())
    
    // Check for mode changes
    const modesAdded = incomingModeNames.filter(name => !localModeNames.includes(name)).length
    const modesRemoved = localModeNames.filter(name => !incomingModeNames.includes(name)).length
    const modeMismatch = modesAdded > 0 || modesRemoved > 0 ? { added: modesAdded, removed: modesRemoved } : null

    const localModeMap = {}
    existing.modes.forEach(m => localModeMap[m.name.toLowerCase()] = m.modeId)

    // Check for New and Changed
    for (const path of allIncomingPaths) {
      const local = existingVarsByName[path]
      if (!local) {
        newCount++
      } else {
        let hasMismatch = false
        for (const incomingMode of collData.modes) {
          const modeId = localModeMap[incomingMode.modeName.toLowerCase()] || existing.modes[0].modeId
          const localValue = local.valuesByMode[modeId]
          const token = incomingMode.tokens[path]
          
          if (token && !isBetterEqual(localValue, token, local.resolvedType, varNameById, varCollById)) {
            hasMismatch = true
            break
          }
        }
        if (hasMismatch) changedCount++
        else sameCount++
      }
    }

    // Check for Removed (Figma has it, ZIP doesn't)
    for (const normName in existingVarsByName) {
      if (!allIncomingPaths.has(normName)) {
        removedCount++
      }
    }
    
    return { 
      name: collData.name, 
      status: 'CONFLICT', 
      newCount, 
      changedCount, 
      sameCount, 
      removedCount,
      modeMismatch
    }
  })
  
  figma.ui.postMessage({ type: 'CONFLICTS_FOUND', analysis })
}

function isBetterEqual(localValue, incomingToken, type, varNameById, varCollById) {
  const localIsAlias = localValue && localValue.type === 'VARIABLE_ALIAS'
  const incomingIsAlias = !!incomingToken.alias

  // Type mismatch (one is alias, other is raw)
  if (localIsAlias !== incomingIsAlias) return false

  if (localIsAlias) {
    const localTargetName = varNameById[localValue.id] || ''
    const localTargetSet  = varCollById[localValue.id] || ''
    return localTargetName === incomingToken.alias.targetName && 
           localTargetSet  === incomingToken.alias.targetSet
  }

  const incomingValue = toFigmaValue(incomingToken.type, incomingToken.value)

  if (type === 'COLOR') {
    if (!localValue || !incomingValue) return localValue === incomingValue
    return Math.abs(localValue.r - (incomingValue.r || 0)) < 0.005 && 
           Math.abs(localValue.g - (incomingValue.g || 0)) < 0.005 && 
           Math.abs(localValue.b - (incomingValue.b || 0)) < 0.005 && 
           Math.abs((localValue.a||1) - (incomingValue.a||1)) < 0.01
  }
  return localValue === incomingValue
}

// ─── IMPORT ───────────────────────────────────────────────────────────────────

async function handleImport(collections, strategy = 'CREATE') {
  const localCollections = figma.variables.getLocalVariableCollections()
  const results      = []  // per-collection summary
  const pendingAliases = [] // resolved after all variables exist
  const variableMap  = {} // 'CollectionName/token/path' → variableId
  const collectionMap = {} // collectionName → { collection, modeMap }

  try {
    const collectionStats = {} // collName -> { success: Set(paths), errors: [], total: 0 }
    const newVariableIds = new Set()

    // NEW: Pre-populate variableMap with ALL existing local variables to support cross-collection aliases
    const allLocalCollections = figma.variables.getLocalVariableCollections()
    const allLocalVars = figma.variables.getLocalVariables()
    allLocalVars.forEach(v => {
      const coll = allLocalCollections.find(c => c.id === v.variableCollectionId)
      if (coll) variableMap[`${coll.name}/${v.name}`] = v.id
    })

    for (const collData of collections) {
      const collName = collData.name
      let collection
      let modeMap = {}
      collectionStats[collName] = { success: new Set(), errors: [], total: (collData.modes[0] && collData.modes[0].tokens) ? Object.keys(collData.modes[0].tokens).length : 0 }

      // ── Resolve Collection ──
      const existing = localCollections.find(c => c.name === collName)
      
      if (strategy === 'UPDATE' && existing) {
        collection = existing
        collection.modes.forEach(m => modeMap[m.name] = m.modeId)
      } else {
        const finalName = (strategy === 'NEW' && existing) ? `${collName} (Imported)` : collName
        collection = figma.variables.createVariableCollection(finalName)
      }

      // ── Sync Modes ──
      const incomingModeNames = collData.modes.map(m => m.modeName)
      const orderedModes = sortModes(collName, incomingModeNames)

      if (strategy === 'UPDATE' && existing) {
        for (const modeName of orderedModes) {
          if (!modeMap[modeName]) {
            modeMap[modeName] = collection.addMode(modeName)
          }
        }
      } else {
        let firstMode = true
        for (const modeName of orderedModes) {
          if (firstMode) {
            const defaultId = collection.modes[0].modeId
            collection.renameMode(defaultId, modeName)
            modeMap[modeName] = defaultId
            firstMode = false
          } else {
            modeMap[modeName] = collection.addMode(modeName)
          }
        }
      }

      collectionMap[collName] = { collection, modeMap }

      // ── Create/Update variables ──
      for (const modeData of collData.modes) {
        const modeId = modeMap[modeData.modeName]
        if (modeId === undefined) continue

        for (const [path, token] of Object.entries(modeData.tokens)) {
          const varKey = `${collName}/${path}`
          let variable

          try {
            if (!variableMap[varKey]) {
              const resolvedType = toFigmaType(token.type)
              variable = figma.variables.createVariable(path, collection, resolvedType)
              variableMap[varKey] = variable.id
              newVariableIds.add(variable.id)
            } else {
              variable = figma.variables.getVariableById(variableMap[varKey])
            }

            if (!variable) continue

            // Metadata
            if (token.scopes) {
              const mapped = mapScopes(token.scopes, variable.resolvedType)
              if (mapped.length > 0) variable.scopes = mapped
            }
            if (token.hidden !== undefined) variable.hiddenFromPublishing = token.hidden
            if (token.codeSyntax) {
              for (const [platform, value] of Object.entries(token.codeSyntax)) {
                const p = platform.toUpperCase()
                if (['WEB', 'ANDROID', 'IOS'].includes(p)) {
                  variable.setVariableCodeSyntax(p, value)
                }
              }
            }

            if (token.alias) {
              pendingAliases.push({
                varId: variable.id,
                modeId,
                targetName: token.alias.targetName,
                targetSet:  token.alias.targetSet,
                collName,
                path
              })
            } else {
              variable.setValueForMode(modeId, toFigmaValue(token.type, token.value))
              collectionStats[collName].success.add(path)
            }
          } catch (e) {
            collectionStats[collName].errors.push(`${path}: ${e.message}`)
          }
        }
      }
    }

    // ── Resolve Aliases ──
    const aliasErrors = []
    for (const { varId, modeId, targetName, targetSet, collName, path } of pendingAliases) {
      const variable = figma.variables.getVariableById(varId)
      if (!variable) continue

      const targetKey = `${targetSet}/${targetName}`
      const targetId  = variableMap[targetKey]

      if (!targetId) {
        const err = `Unresolved alias — ${variable.name} → ${targetName} (${targetSet})`
        aliasErrors.push(err)
        collectionStats[collName].errors.push(`${path}: Unresolved alias`)
        // If it was a new variable and it has NO valid values, remove it
        if (newVariableIds.has(varId)) {
          try {
             // Check if it has any other successful modes or values? 
             // For simplicity, if the ALIAS fails and it's new, we prune it.
             variable.remove()
             newVariableIds.delete(varId)
             delete variableMap[`${collName}/${path}`]
          } catch(e){}
        }
        continue
      }

      try {
        const targetVar = figma.variables.getVariableById(targetId)
        variable.setValueForMode(modeId, figma.variables.createVariableAlias(targetVar))
        collectionStats[collName].success.add(path)
      } catch (e) {
        const err = `Alias failed — ${variable.name}: ${e.message}`
        aliasErrors.push(err)
        collectionStats[collName].errors.push(`${path}: ${e.message}`)
        if (newVariableIds.has(varId)) {
          try { variable.remove(); newVariableIds.delete(varId); delete variableMap[`${collName}/${path}`] } catch(ex){}
        }
      }
    }

    const results = Object.entries(collectionStats).map(([name, stats]) => ({
      name,
      successCount: stats.success.size,
      totalCount: stats.total,
      errors: stats.errors
    }))

    figma.ui.postMessage({ type: 'IMPORT_COMPLETE', results, aliasErrors })

  } catch (e) {
    figma.ui.postMessage({ type: 'IMPORT_ERROR', message: e.message })
  }
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

async function handleExport() {
  try {
    const local = figma.variables.getLocalVariableCollections()

    // Sort by standard collection order
    const sorted = [...local].sort((a, b) => {
      const ai = COLLECTION_ORDER.indexOf(a.name)
      const bi = COLLECTION_ORDER.indexOf(b.name)
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })

    // Build a quick id→name lookup across all collections
    const varNameById = {}
    const varCollById = {}
    for (const coll of sorted) {
      for (const vid of coll.variableIds) {
        const v = figma.variables.getVariableById(vid)
        if (v) { varNameById[vid] = v.name; varCollById[vid] = coll.name }
      }
    }

    const exportData = []

    for (let i = 0; i < sorted.length; i++) {
      const coll   = sorted[i]
      const folder = `${i + 1}. ${coll.name}`
      const modes  = []

      // Sort modes in preferred order for export
      const orderedModes = sortModeObjects(coll.name, coll.modes)

      for (const mode of orderedModes) {
        const tree = {}

        for (const vid of coll.variableIds) {
          const variable = figma.variables.getVariableById(vid)
          if (!variable) continue

          const value = variable.valuesByMode[mode.modeId]
          const tokenNode = buildExportToken(variable, value, varNameById, varCollById)

          nestByPath(tree, variable.name, tokenNode)
        }

        // Append $metadata
        tree['$metadata'] = { modeName: mode.name }

        modes.push({ modeName: mode.name, json: JSON.stringify(tree, null, 2) })
      }

      exportData.push({ folder, modes })
    }

    figma.ui.postMessage({ type: 'EXPORT_DATA', exportData })

  } catch (e) {
    figma.ui.postMessage({ type: 'EXPORT_ERROR', message: e.message })
  }
}

// ─── GET COLLECTIONS LIST (for Export tab preview) ─────────────────────────

function sendCollectionsList() {
  const cols = figma.variables.getLocalVariableCollections()
  figma.ui.postMessage({
    type: 'COLLECTIONS_LIST',
    collections: cols.map(c => ({
      id: c.id,
      name: c.name,
      tokenCount: c.variableIds.length,
      modes: c.modes.map(m => m.name)
    }))
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function sortModes(collName, modeNames) {
  const pref = MODE_ORDER[collName]
  if (!pref) return modeNames
  const ordered = pref.filter(m => modeNames.includes(m))
  const extras  = modeNames.filter(m => !pref.includes(m))
  return [...ordered, ...extras]
}

function sortModeObjects(collName, modes) {
  const pref = MODE_ORDER[collName]
  if (!pref) return modes
  return [...modes].sort((a, b) => {
    const ai = pref.indexOf(a.name); const bi = pref.indexOf(b.name)
    if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
    if (ai === -1) return 1; if (bi === -1) return -1
    return ai - bi
  })
}

function toFigmaType(type) {
  return { color: 'COLOR', number: 'FLOAT', string: 'STRING', boolean: 'BOOLEAN' }[type] || 'FLOAT'
}

function mapScopes(rawScopes, figmaType) {
  if (!rawScopes || !Array.isArray(rawScopes)) return []
  if (rawScopes.includes('ALL')) return [] // Defaults to all in Figma if empty

  const mapped = new Set()
  for (const s of rawScopes) {
    const scope = s.toUpperCase()
    
    // Direct matches or specific mappings
    if (scope === 'TEXT') {
      mapped.add('TEXT_CONTENT')
      if (figmaType === 'COLOR') mapped.add('TEXT_FILL')
      continue
    }
    
    if (scope === 'FILL') {
      mapped.add('FRAME_FILL')
      mapped.add('SHAPE_FILL')
      if (figmaType === 'COLOR') mapped.add('TEXT_FILL')
      continue
    }
    
    if (scope === 'STROKE') {
      if (figmaType === 'COLOR') mapped.add('STROKE_COLOR')
      if (figmaType === 'FLOAT') mapped.add('STROKE_FLOAT')
      continue
    }
    
    if (scope === 'RADIUS' || scope === 'CORNER_RADIUS') {
      mapped.add('CORNER_RADIUS')
      continue
    }

    if (scope === 'GAP') {
      mapped.add('GAP')
      continue
    }

    if (scope === 'OPACITY') {
      mapped.add('OPACITY')
      continue
    }

    if (scope === 'EFFECT') {
      if (figmaType === 'COLOR') mapped.add('EFFECT_COLOR')
      if (figmaType === 'FLOAT') mapped.add('EFFECT_FLOAT')
      continue
    }
    
    if (scope === 'WIDTH' || scope === 'HEIGHT' || scope === 'SIZE') {
      mapped.add('WIDTH_HEIGHT')
      continue
    }

    // If it's already a valid enum (the error message provided the full list)
    const validEnums = [
      'TEXT_CONTENT', 'CORNER_RADIUS', 'WIDTH_HEIGHT', 'GAP', 'ALL_FILLS', 
      'FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_FLOAT', 'EFFECT_FLOAT', 
      'EFFECT_COLOR', 'OPACITY', 'FONT_STYLE', 'FONT_FAMILY', 'FONT_SIZE', 
      'LINE_HEIGHT', 'LETTER_SPACING', 'PARAGRAPH_SPACING', 'PARAGRAPH_INDENT', 
      'TRANSFORM', 'STROKE_COLOR', 'FONT_WEIGHT'
    ]
    if (validEnums.includes(scope)) {
      mapped.add(scope)
    }
  }
  
  return Array.from(mapped)
}

function toFigmaValue(type, value) {
  if (type === 'color') {
    if (value && value.components) {
      return { r: value.components[0], g: value.components[1], b: value.components[2], a: (value.alpha !== undefined ? value.alpha : 1) }
    }
    // Fallback: parse hex
    const hex = (value && value.hex) ? value.hex : '#000000'
    return {
      r: parseInt(hex.slice(1,3),16)/255,
      g: parseInt(hex.slice(3,5),16)/255,
      b: parseInt(hex.slice(5,7),16)/255,
      a: (value && value.alpha !== undefined) ? value.alpha : 1
    }
  }
  return value
}

function fromFigmaColor(val) {
  if (!val) return { colorSpace:'srgb', components:[0,0,0], alpha:1, hex:'#000000' }
  const r = Math.round(val.r*255).toString(16).padStart(2,'0')
  const g = Math.round(val.g*255).toString(16).padStart(2,'0')
  const b = Math.round(val.b*255).toString(16).padStart(2,'0')
  return { colorSpace:'srgb', components:[val.r, val.g, val.b], alpha: (val.a !== undefined ? val.a : 1), hex:`#${r}${g}${b}` }
}

function getTokenType(resolvedType) {
  return { COLOR:'color', FLOAT:'number', STRING:'string', BOOLEAN:'boolean' }[resolvedType] || 'number'
}

function buildExportToken(variable, value, varNameById, varCollById) {
  const type = getTokenType(variable.resolvedType)

  if (value && value.type === 'VARIABLE_ALIAS') {
    const targetName = varNameById[value.id] || ''
    const targetSet  = varCollById[value.id]  || ''
    const placeholder = type === 'color'
      ? { colorSpace:'srgb', components:[0,0,0], alpha:1, hex:'#000000' }
      : type === 'string' ? '' : 0

    return {
      $type: type,
      $value: placeholder,
      $extensions: {
        'com.figma.variableId': variable.id,
        'com.figma.aliasData': {
          targetVariableId:      value.id,
          targetVariableName:    targetName,
          targetVariableSetName: targetSet
        }
      }
    }
  }

  const exportVal = variable.resolvedType === 'COLOR'
    ? fromFigmaColor(value)
    : (value !== null && value !== undefined ? value : (type === 'string' ? '' : 0))

  return {
    $type: type,
    $value: exportVal,
    $extensions: {
      'com.figma.variableId': variable.id,
      'com.figma.hiddenFromPublishing': true
    }
  }
}

function nestByPath(tree, path, node) {
  const parts = path.split('/')
  let curr = tree
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]]) curr[parts[i]] = {}
    curr = curr[parts[i]]
  }
  curr[parts[parts.length - 1]] = node
}
