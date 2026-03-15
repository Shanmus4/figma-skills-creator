// Token Porter — code.js
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
    case 'IMPORT':       await handleImport(msg.collections); break
    case 'EXPORT':       await handleExport(); break
    case 'GET_COLLECTIONS': sendCollectionsList(); break
  }
}

// ─── IMPORT ───────────────────────────────────────────────────────────────────

async function handleImport(collections) {
  const results      = []  // per-collection summary
  const pendingAliases = [] // resolved after all variables exist
  const variableMap  = {} // 'CollectionName/token/path' → variableId
  const collectionMap = {} // collectionName → { collection, modeMap }

  try {
    for (const collData of collections) {
      const collName = collData.name

      // ── Create collection ──
      const collection = figma.variables.createVariableCollection(collName)
      const modeMap = {}

      // Sort modes into correct order (first = default)
      const orderedModes = sortModes(collName, collData.modes.map(m => m.modeName))

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

      collectionMap[collName] = { collection, modeMap }

      // ── Create variables and set primitive values ──
      let tokenCount  = 0
      const tokenErrors = []

      // Iterate modes in the order they arrived (all modes share same paths)
      for (const modeData of collData.modes) {
        const modeId = modeMap[modeData.modeName]
        if (modeId === undefined) continue

        for (const [path, token] of Object.entries(modeData.tokens)) {
          const varKey = `${collName}/${path}`

          // Create variable only once (first mode encounter)
          if (!variableMap[varKey]) {
            try {
              const resolvedType = toFigmaType(token.type)
              const variable = figma.variables.createVariable(path, collection, resolvedType)
              variableMap[varKey] = variable.id
              tokenCount++
            } catch (e) {
              tokenErrors.push(`Create failed — ${path}: ${e.message}`)
              continue
            }
          }

          const variable = figma.variables.getVariableById(variableMap[varKey])
          if (!variable) continue

          if (token.alias) {
            // Queue alias — target may not exist yet
            pendingAliases.push({
              varId: variable.id,
              modeId,
              targetName: token.alias.targetName,
              targetSet:  token.alias.targetSet
            })
          } else {
            try {
              variable.setValueForMode(modeId, toFigmaValue(token.type, token.value))
            } catch (e) {
              tokenErrors.push(`Value failed — ${path}: ${e.message}`)
            }
          }
        }
      }

      results.push({ name: collName, tokenCount, errors: tokenErrors })
    }

    // ── Resolve all aliases now that every variable exists ──
    const aliasErrors = []

    for (const { varId, modeId, targetName, targetSet } of pendingAliases) {
      const variable = figma.variables.getVariableById(varId)
      if (!variable) continue

      const targetKey = `${targetSet}/${targetName}`
      const targetId  = variableMap[targetKey]

      if (!targetId) {
        aliasErrors.push(`Unresolved alias — ${variable.name} → ${targetName} (${targetSet})`)
        continue
      }

      try {
        const targetVar = figma.variables.getVariableById(targetId)
        variable.setValueForMode(modeId, figma.variables.createVariableAlias(targetVar))
      } catch (e) {
        aliasErrors.push(`Alias failed — ${variable.name}: ${e.message}`)
      }
    }

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
