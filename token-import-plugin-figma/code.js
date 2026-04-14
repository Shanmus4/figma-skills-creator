// Variables Tokens Collections Importer — code.js
// Runs in the Figma plugin sandbox. Has access to figma.* API but no DOM.

const COLLECTION_ORDER = [
  'Primitives', 'Theme', 'Semantic', 'Responsive',
  'Density', 'Layout', 'Effects', 'Typography',
  'Component Colors', 'Component Dimensions'
]

const MODE_ORDER = {
  'Theme':     ['light', 'dark'],
  'Semantic':  ['light', 'dark'],
  'Responsive':['mobile', 'tablet', 'desktop'],
  'Density':   ['comfortable', 'compact', 'spacious'],
  'Layout':    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
}

figma.showUI(__html__, { width: 420, height: 600, themeColors: true })

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'CHECK_CONFLICTS': await checkConflicts(msg.collections); break
    case 'IMPORT':          await handleImport(msg.collections, msg.strategy, msg.autoScope, msg.generateStyles); break
    case 'EXPORT':          await handleExport(); break
    case 'GET_COLLECTIONS': await sendCollectionsList(); break
  }
}

// ─── CONFLICT DETECTION ───────────────────────────────────────────────────────

async function checkConflicts(collections) {
  try {
    const localCollections = await figma.variables.getLocalVariableCollectionsAsync()
    const localVars = await figma.variables.getLocalVariablesAsync()
    const varNameById = {}
    const varCollById = {}
    
    for (const coll of localCollections) {
      for (const vid of coll.variableIds) {
        const v = localVars.find(lv => lv.id === vid)
        if (v) { varNameById[vid] = v.name; varCollById[vid] = coll.name }
      }
    }
    
    const analysis = collections.map(collData => {
      const collection = localCollections.find(c => c.name.toLowerCase() === collData.name.toLowerCase())
      if (!collection) return { name: collData.name, status: 'NEW', tokenCount: collData.tokenCount }
      
      let newCount = 0, changedCount = 0, sameCount = 0, removedCount = 0
      const existingVars = localVars.filter(v => v.variableCollectionId === collection.id)
      const existingVarsByName = {}
      
      existingVars.forEach(v => {
        const normName = v.name.split('/').map(seg => seg.trim()).filter(Boolean).join('/')
        existingVarsByName[normName] = v
      })

      // 1. Audit Modes
      const localModeNames = collection.modes.map(m => m.name.toLowerCase())
      const incomingModeNames = collData.modes.map(m => m.modeName.toLowerCase())
      const removedModes = collection.modes.filter(m => !incomingModeNames.includes(m.name.toLowerCase())).map(m => m.name)
      const addedModes = collData.modes.filter(m => !localModeNames.includes(m.modeName.toLowerCase())).map(m => m.modeName)
      const modeStats = { removed: removedModes, added: addedModes }

      // 2. Pre-normalize Incoming Tokens for lookup
      // normalizedModes: [ { name: 'ModeName', tokens: { 'normalizedPath': value } } ]
      const normalizedModes = collData.modes.map(m => {
        const normTokens = {}
        for (const [p, val] of Object.entries(m.tokens)) {
          const np = p.split('/').map(s => s.trim()).filter(Boolean).join('/')
          normTokens[np] = val
        }
        return { name: m.modeName.toLowerCase(), tokens: normTokens }
      })

      // All paths in the ZIP
      const zipPaths = new Set()
      normalizedModes.forEach(m => Object.keys(m.tokens).forEach(p => zipPaths.add(p)))

      // 3. Variable Audit
      // Check Figma side for SAME/UPDATE/LESS
      for (const normName in existingVarsByName) {
        if (!zipPaths.has(normName)) {
          removedCount++
          console.log(`[LESS] Missing from ZIP: "${normName}"`);
        } else {
          const v = existingVarsByName[normName]
          let hasMismatch = false
          let sharedModeFound = false

          for (const zm of normalizedModes) {
            const targetMode = collection.modes.find(m => m.name.toLowerCase() === zm.name)
            if (targetMode) {
              sharedModeFound = true
              const localValue = v.valuesByMode[targetMode.modeId]
              const incomingToken = zm.tokens[normName]
              if (incomingToken && !isBetterEqual(localValue, incomingToken, v.resolvedType, varNameById, varCollById)) {
                hasMismatch = true
                break
              }
            }
          }
          if (hasMismatch) changedCount++
          else sameCount++
        }
      }

      // Check ZIP side for NEW
      for (const p of zipPaths) {
        if (!existingVarsByName[p]) newCount++
      }

      return { name: collection.name, status: 'CONFLICT', newCount, changedCount, sameCount, removedCount, modeStats }
    })
    
    figma.ui.postMessage({ type: 'CONFLICTS_FOUND', analysis })
  } catch (e) {
    console.error(e)
    figma.ui.postMessage({ type: 'IMPORT_ERROR', message: `Conflict analysis failed: ${e.message}` })
  }
}

function isBetterEqual(localValue, incomingToken, type, varNameById, varCollById) {
  const localIsAlias = !!(localValue && typeof localValue === 'object' && localValue.type === 'VARIABLE_ALIAS')
  const incomingIsAlias = !!(incomingToken && incomingToken.alias)

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

async function handleImport(collections, strategy = 'CREATE', autoScope = true, generateStyles = true) {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync()
  const results      = []  // per-collection summary
  const pendingAliases = [] // resolved after all variables exist
  const variableMap  = {} // 'CollectionName/token/path' → variableId
  const collectionMap = {} // collectionName → { collection, modeMap }

  try {
    const collectionStats = {} // collName -> { success: Set(paths), failures: Set(paths), errors: [], total: 0 }
    const newVariableIds = new Set()

    // NEW: Pre-populate variableMap with ALL existing local variables to support cross-collection aliases
    const allLocalCollections = await figma.variables.getLocalVariableCollectionsAsync()
    const allLocalVars = await figma.variables.getLocalVariablesAsync()
    allLocalVars.forEach(v => {
      const coll = allLocalCollections.find(c => c.id === v.variableCollectionId)
      if (coll) {
        // MUST normalize local name to match ZIP paths
        const normName = v.name.split('/').map(s => s.trim()).filter(Boolean).join('/')
        variableMap[`${coll.name}/${normName}`] = v.id
      }
    })

    for (const collData of collections) {
      const collName = collData.name
      let collection
      let modeMap = {}
      collectionStats[collName] = { 
        success: new Set(), 
        failures: new Set(),
        errors: [], 
        total: 0 
      }
      
      const zipPathsForThisColl = new Set()
      collData.modes.forEach(m => Object.keys(m.tokens).forEach(p => {
        const np = p.split('/').map(s => s.trim()).filter(Boolean).join('/')
        zipPathsForThisColl.add(np)
      }))
      collectionStats[collName].total = zipPathsForThisColl.size

      // ── Resolve Collection (Case Sensitive per User Request) ──
      const existing = localCollections.find(c => c.name === collName)

      // ── Sync Modes ──
      const incomingModeNames = collData.modes.map(m => m.modeName.toLowerCase())
      const orderedModes = sortModes(collName, collData.modes.map(m => m.modeName))

      if (strategy === 'UPDATE' && existing) {
        collection = existing
        // Deletion: Remove modes NOT in incoming data
        const localModes = collection.modes
        localModes.forEach(m => {
          if (!incomingModeNames.includes(m.name.toLowerCase())) {
             console.log(`[SYNC] Deleting orphaned mode: ${m.name}`)
             try { collection.removeMode(m.modeId) } catch(e) { console.error(`Failed to remove mode ${m.name}: ${e.message}`) }
          } else {
             modeMap[m.name.toLowerCase()] = m.modeId
          }
        })

        // Addition: Add missing modes
        orderedModes.forEach(mName => {
          if (!modeMap[mName.toLowerCase()]) {
            modeMap[mName.toLowerCase()] = collection.addMode(mName)
          }
        })
      } else {
        const finalName = (strategy === 'NEW' && existing) ? `${collName} (Imported)` : collName
        collection = figma.variables.createVariableCollection(finalName)
        
        let firstMode = true
        for (const modeName of orderedModes) {
          if (firstMode) {
            const defaultId = collection.modes[0].modeId
            collection.renameMode(defaultId, modeName)
            modeMap[modeName.toLowerCase()] = defaultId
            firstMode = false
          } else {
            modeMap[modeName.toLowerCase()] = collection.addMode(modeName)
          }
        }
      }

      // ── Sync Variables (Deletions first for Replace mode) ──
      if (strategy === 'UPDATE' && existing) {
        const zipPaths = new Set()
        collData.modes.forEach(m => Object.keys(m.tokens).forEach(p => {
          zipPaths.add(p.split('/').map(seg => seg.trim()).filter(Boolean).join('/'))
        }))

        const collectionVars = (await figma.variables.getLocalVariablesAsync()).filter(v => v.variableCollectionId === collection.id)
        collectionVars.forEach(v => {
          const normName = v.name.split('/').map(seg => seg.trim()).filter(Boolean).join('/')
          if (!zipPaths.has(normName)) {
            console.log(`[SYNC] Deleting orphaned variable: ${v.name}`)
            try { 
              v.remove() 
              delete variableMap[`${collName}/${normName}`]
            } catch(e) { console.error(`Failed remove: ${e.message}`) }
          }
        })
      }

      // ── Create/Update variables ──
      for (const modeData of collData.modes) {
        const modeId = modeMap[modeData.modeName.toLowerCase()]
        if (modeId === undefined) continue

        for (const [rawPath, token] of Object.entries(modeData.tokens)) {
          const path = rawPath.split('/').map(s => s.trim()).filter(Boolean).join('/')
          const varKey = `${collName}/${path}`
          let variable

          try {
            if (!variableMap[varKey]) {
              variable = figma.variables.createVariable(path, collection, toFigmaType(token.type))
              variableMap[varKey] = variable.id
              newVariableIds.add(variable.id)
            } else {
              variable = await figma.variables.getVariableByIdAsync(variableMap[varKey])
            }

            if (!variable) continue

            // Metadata
            if (token.scopes) {
              const mapped = mapScopes(token.scopes, variable.resolvedType)
              if (mapped.length > 0) variable.scopes = mapped
            }
            if (token.hidden !== undefined) {
              variable.hiddenFromPublishing = token.hidden
              // Auto-scoping: If hiddenFromPublishing is true, clear scopes so it doesn't clutter local pickers
              if (autoScope && token.hidden === true) {
                variable.scopes = []
              }
            }
            if (token.codeSyntax) {
              for (const [platform, value] of Object.entries(token.codeSyntax)) {
                const p = platform.toUpperCase()
                const figmaPlatform = { 'WEB': 'WEB', 'ANDROID': 'ANDROID', 'IOS': 'iOS' }[p]
                if (figmaPlatform) {
                  variable.setVariableCodeSyntax(figmaPlatform, value)
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
              // We'll calculate success at the end based on failures
            }
          } catch (e) {
            collectionStats[collName].failures.add(path)
            collectionStats[collName].errors.push(`${path}: ${e.message}`)
          }
        }
      }
    }

    // ── Resolve Aliases ──
    const aliasErrors = []
    for (const { varId, modeId, targetName, targetSet, collName, path } of pendingAliases) {
      const variable = await figma.variables.getVariableByIdAsync(varId)
      if (!variable) continue

      const targetKey = `${targetSet}/${targetName}`
      const targetId  = variableMap[targetKey]

      if (!targetId) {
        const fullTarget = `${targetSet}/${targetName}`
        collectionStats[collName].failures.add(path)
        collectionStats[collName].errors.push(`${path}: Unresolved alias (Target: ${fullTarget})`)
        
        // If "Replace" sync, we MUST remove it even if it existed before, 
        // because the source of truth (ZIP) has is in a broken state.
        if (strategy === 'UPDATE' || newVariableIds.has(varId)) {
          console.log(`[SYNC] Removing variable due to broken alias: ${path}`)
          try {
             variable.remove()
             newVariableIds.delete(varId)
             delete variableMap[`${collName}/${path}`]
          } catch(e){}
        }
        continue
      }

      try {
        const targetVar = await figma.variables.getVariableByIdAsync(targetId)
        variable.setValueForMode(modeId, figma.variables.createVariableAlias(targetVar))
      } catch (e) {
        collectionStats[collName].failures.add(path)
        collectionStats[collName].errors.push(`${path}: ${e.message}`)
        if (strategy === 'UPDATE' || newVariableIds.has(varId)) {
          console.log(`[SYNC] Removing variable due to alias error: ${path}`)
          try { variable.remove(); newVariableIds.delete(varId); delete variableMap[`${collName}/${path}`] } catch(ex){}
        }
      }
    }

    // ── Final Success Tally ──
    for (const collName in collectionStats) {
      const stats = collectionStats[collName]
      const collData = collections.find(c => c.name === collName)
      if (!collData) continue
      
      const zipPaths = new Set()
      collData.modes.forEach(m => Object.keys(m.tokens).forEach(p => {
        const np = p.split('/').map(s => s.trim()).filter(Boolean).join('/')
        zipPaths.add(np)
      }))
      
      zipPaths.forEach(p => {
        if (!stats.failures.has(p)) {
          stats.success.add(p)
        }
      })
    }

    // ── Style Generation Phase ──
    let styleResults = { text: 0, effect: 0, grid: 0, errors: [] }
    if (generateStyles) {
      try {
        styleResults = await generateStylesFromVariables(variableMap)
      } catch (e) {
        styleResults.errors.push(`Style generation failed: ${e.message}`)
        console.error('[STYLES] Generation error:', e)
      }
    }

    figma.ui.postMessage({ type: 'IMPORT_COMPLETE', results: Object.entries(collectionStats).map(([name, stats]) => ({
      name,
      successCount: stats.success.size,
      totalCount: stats.total,
      errors: stats.errors
    })), styleResults })

  } catch (e) {
    figma.ui.postMessage({ type: 'IMPORT_ERROR', message: e.message })
  }
}

// ─── STYLE GENERATION ─────────────────────────────────────────────────────────

async function generateStylesFromVariables(variableMap) {
  const results = { text: 0, effect: 0, grid: 0, errors: [] }

  // Get all existing local styles to avoid duplicates
  const existingTextStyles = await figma.getLocalTextStylesAsync()
  const existingEffectStyles = await figma.getLocalEffectStylesAsync()
  const existingGridStyles = await figma.getLocalGridStylesAsync()

  const existingTextNames = new Set(existingTextStyles.map(s => s.name))
  const existingEffectNames = new Set(existingEffectStyles.map(s => s.name))
  const existingGridNames = new Set(existingGridStyles.map(s => s.name))

  // Typography
  try {
    results.text = await generateTextStyles(variableMap, existingTextNames)
  } catch (e) {
    results.errors.push(`Text styles: ${e.message}`)
    console.error('[STYLES] Text style error:', e)
  }

  // Effects
  try {
    results.effect = await generateEffectStyles(variableMap, existingEffectNames)
  } catch (e) {
    results.errors.push(`Effect styles: ${e.message}`)
    console.error('[STYLES] Effect style error:', e)
  }

  // Layout / Grid
  try {
    results.grid = await generateGridStyles(variableMap, existingGridNames)
  } catch (e) {
    results.errors.push(`Grid styles: ${e.message}`)
    console.error('[STYLES] Grid style error:', e)
  }

  console.log(`[STYLES] Created: ${results.text} text, ${results.effect} effect, ${results.grid} grid styles`)
  return results
}

function capitalizeStyleName(raw) {
  // "hugedisplay" -> "Hugedisplay", "shadow/sm" -> "Shadow/Sm"
  return raw.split('/').map(seg => seg.charAt(0).toUpperCase() + seg.slice(1)).join('/')
}

function buildTextStyleName(groupName, allGroupNames) {
  // Always group text styles: Groupname/leaf-name
  // Group name: first letter caps. Leaf name: lowercase with dashes.
  // e.g. buttonsm -> Button/button-sm, display -> Display/display
  // e.g. caption1 -> Caption/caption-1, title2 -> Title/title-2
  const SIZE_SUFFIXES = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '2xl', '3xl', '4xl', '5xl']

  let base = null, suffix = null

  // Check for size suffix
  for (const sz of SIZE_SUFFIXES) {
    if (groupName.length > sz.length && groupName.endsWith(sz)) {
      base = groupName.slice(0, -sz.length)
      suffix = sz
      break
    }
  }

  // Check for trailing digits (e.g. body1, title2, heading3)
  if (!base) {
    const digitMatch = groupName.match(/^(.+?)(\d+)$/)
    if (digitMatch) {
      base = digitMatch[1]
      suffix = digitMatch[2]
    }
  }

  if (base && suffix) {
    // Has a detectable suffix - check if others share this base
    const hasRelative = allGroupNames.some(other => {
      if (other === groupName) return false
      return other.startsWith(base) && other.length > base.length
    })
    if (hasRelative) {
      // Group with shared base: Button/button-sm
      return capitalizeStyleName(base) + '/' + base + '-' + suffix
    }
  }

  // Either no suffix or no relatives - still create a group with same name
  // Display/display, Code/code, Headline/headline
  return capitalizeStyleName(groupName) + '/' + groupName
}

function parseFirstFontFamily(cssStack) {
  // Extract first font name from CSS font-family stack
  // "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ..." -> tries each until found
  if (!cssStack) return null
  const candidates = cssStack.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''))
  // Filter out CSS keywords / system fonts that Figma won't have
  const skip = new Set(['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'])
  for (const c of candidates) {
    if (!skip.has(c) && c.length > 0) return c
  }
  return candidates[0] || null
}

function mapWeightToFigmaStyle(weight) {
  // Map common weight strings to Figma font style names
  if (!weight) return 'Regular'
  const w = weight.trim()
  const map = {
    'thin': 'Thin', '100': 'Thin',
    'extralight': 'ExtraLight', 'ultralight': 'ExtraLight', '200': 'ExtraLight',
    'light': 'Light', '300': 'Light',
    'regular': 'Regular', 'normal': 'Regular', '400': 'Regular',
    'medium': 'Medium', '500': 'Medium',
    'semibold': 'SemiBold', 'demibold': 'SemiBold', '600': 'SemiBold',
    'bold': 'Bold', '700': 'Bold',
    'extrabold': 'ExtraBold', 'ultrabold': 'ExtraBold', '800': 'ExtraBold',
    'black': 'Black', 'heavy': 'Black', '900': 'Black'
  }
  return map[w.toLowerCase()] || w
}

async function generateTextStyles(variableMap, existingNames) {
  // Group Typography variables: Typography/display/fontsize -> group "display", prop "fontsize"
  const groups = {}
  const TYPO_PROPS = new Set(['fontsize', 'lineheight', 'letterspacing', 'fontfamily', 'fontweight'])

  for (const key of Object.keys(variableMap)) {
    if (!key.startsWith('Typography/')) continue
    const rest = key.slice('Typography/'.length) // e.g. "display/fontsize"
    const parts = rest.split('/')
    if (parts.length < 2) continue
    const prop = parts[parts.length - 1]
    if (!TYPO_PROPS.has(prop)) continue
    const groupName = parts.slice(0, -1).join('/') // supports nested like "display" or "button/lg"
    if (!groups[groupName]) groups[groupName] = {}
    groups[groupName][prop] = variableMap[key]
  }

  let count = 0
  for (const [groupName, props] of Object.entries(groups)) {
    // Must have at least fontsize to be a valid text style
    if (!props.fontsize) continue

    const styleName = buildTextStyleName(groupName, Object.keys(groups))
    if (existingNames.has(styleName)) {
      console.log(`[STYLES] Skipping existing text style: ${styleName}`)
      continue
    }

    try {
      // Read raw values from variables to set initial static properties
      const fsVar = await figma.variables.getVariableByIdAsync(props.fontsize)
      const lhVar = props.lineheight ? await figma.variables.getVariableByIdAsync(props.lineheight) : null
      const lsVar = props.letterspacing ? await figma.variables.getVariableByIdAsync(props.letterspacing) : null
      const ffVar = props.fontfamily ? await figma.variables.getVariableByIdAsync(props.fontfamily) : null
      const fwVar = props.fontweight ? await figma.variables.getVariableByIdAsync(props.fontweight) : null

      if (!fsVar) continue

      // Resolve values (follows alias chains to get the actual raw value)
      const fsVal = await resolveVariableValue(fsVar)
      const lhVal = lhVar ? await resolveVariableValue(lhVar) : null
      const lsVal = lsVar ? await resolveVariableValue(lsVar) : null
      const ffVal = ffVar ? await resolveVariableValue(ffVar) : null
      const fwVal = fwVar ? await resolveVariableValue(fwVar) : null

      // Determine font to load
      const familyName = ffVal ? parseFirstFontFamily(String(ffVal)) : null
      const styleSuffix = fwVal ? mapWeightToFigmaStyle(String(fwVal)) : 'Regular'

      const textStyle = figma.createTextStyle()
      textStyle.name = styleName

      // Load and set font - must match the resolved variable values for binding to stick
      const fontToLoad = { family: familyName || 'Inter', style: styleSuffix }
      try {
        await figma.loadFontAsync(fontToLoad)
        textStyle.fontName = fontToLoad
      } catch (fontErr) {
        // Fallback: try family with Regular, then Inter Regular
        try {
          const fallback1 = { family: familyName || 'Inter', style: 'Regular' }
          await figma.loadFontAsync(fallback1)
          textStyle.fontName = fallback1
        } catch (e2) {
          try {
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
            textStyle.fontName = { family: 'Inter', style: 'Regular' }
          } catch (e3) {
            await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' })
          }
        }
      }

      // Set static values
      if (typeof fsVal === 'number') textStyle.fontSize = fsVal
      if (typeof lhVal === 'number') textStyle.lineHeight = { value: lhVal, unit: 'PIXELS' }
      if (typeof lsVal === 'number') textStyle.letterSpacing = { value: lsVal, unit: 'PIXELS' }

      // Bind variables
      try { textStyle.setBoundVariable('fontSize', fsVar) } catch (e) { console.warn(`[STYLES] Could not bind fontSize for ${styleName}: ${e.message}`) }
      if (lhVar) try { textStyle.setBoundVariable('lineHeight', lhVar) } catch (e) { console.warn(`[STYLES] Could not bind lineHeight for ${styleName}: ${e.message}`) }
      if (lsVar) try { textStyle.setBoundVariable('letterSpacing', lsVar) } catch (e) { console.warn(`[STYLES] Could not bind letterSpacing for ${styleName}: ${e.message}`) }
      if (ffVar) try { textStyle.setBoundVariable('fontFamily', ffVar) } catch (e) { console.warn(`[STYLES] Could not bind fontFamily for ${styleName}: ${e.message}`) }
      if (fwVar) try { textStyle.setBoundVariable('fontStyle', fwVar) } catch (e) { console.warn(`[STYLES] Could not bind fontStyle for ${styleName}: ${e.message}`) }

      count++
    } catch (e) {
      console.error(`[STYLES] Failed to create text style "${styleName}": ${e.message}`)
    }
  }
  return count
}

async function generateEffectStyles(variableMap, existingNames) {
  let count = 0

  // ── Shadow Styles ──
  // Group: Effects/shadow/sm/color, Effects/shadow/sm/x, etc.
  const shadowGroups = {}
  const SHADOW_PROPS = new Set(['color', 'x', 'y', 'blur', 'spread'])

  for (const key of Object.keys(variableMap)) {
    if (!key.startsWith('Effects/shadow/')) continue
    const rest = key.slice('Effects/shadow/'.length) // e.g. "sm/color"
    const parts = rest.split('/')
    if (parts.length < 2) continue
    const prop = parts[parts.length - 1]
    if (!SHADOW_PROPS.has(prop)) continue
    const sizeName = parts.slice(0, -1).join('/') // "sm"
    if (!shadowGroups[sizeName]) shadowGroups[sizeName] = {}
    shadowGroups[sizeName][prop] = variableMap[key]
  }

  for (const [sizeName, props] of Object.entries(shadowGroups)) {
    const styleName = `Shadow/shadow-${sizeName}`
    if (existingNames.has(styleName)) {
      console.log(`[STYLES] Skipping existing effect style: ${styleName}`)
      continue
    }

    try {
      // Read raw values
      const colorVar = props.color ? await figma.variables.getVariableByIdAsync(props.color) : null
      const xVar = props.x ? await figma.variables.getVariableByIdAsync(props.x) : null
      const yVar = props.y ? await figma.variables.getVariableByIdAsync(props.y) : null
      const blurVar = props.blur ? await figma.variables.getVariableByIdAsync(props.blur) : null
      const spreadVar = props.spread ? await figma.variables.getVariableByIdAsync(props.spread) : null

      const colorVal = colorVar ? await resolveVariableValue(colorVar) : null
      const xVal = xVar ? await resolveVariableValue(xVar) : 0
      const yVal = yVar ? await resolveVariableValue(yVar) : 0
      const blurVal = blurVar ? await resolveVariableValue(blurVar) : 0
      const spreadVal = spreadVar ? await resolveVariableValue(spreadVar) : 0

      // Build shadow color - handle alias (value might be an alias object)
      let shadowColor = { r: 0, g: 0, b: 0, a: 0.25 }
      if (colorVal && typeof colorVal === 'object') {
        if (colorVal.r !== undefined) {
          shadowColor = { r: colorVal.r, g: colorVal.g, b: colorVal.b, a: colorVal.a !== undefined ? colorVal.a : 0.25 }
        }
      }

      // Build the initial DROP_SHADOW effect
      let effect = {
        type: 'DROP_SHADOW',
        color: shadowColor,
        offset: { x: typeof xVal === 'number' ? xVal : 0, y: typeof yVal === 'number' ? yVal : 0 },
        radius: typeof blurVal === 'number' ? blurVal : 0,
        spread: typeof spreadVal === 'number' ? spreadVal : 0,
        visible: true,
        blendMode: 'NORMAL'
      }

      // Bind variables to the effect using setBoundVariableForEffect
      if (colorVar) try { effect = figma.variables.setBoundVariableForEffect(effect, 'color', colorVar) } catch (e) { console.warn(`[STYLES] Bind shadow color: ${e.message}`) }
      if (xVar) try { effect = figma.variables.setBoundVariableForEffect(effect, 'offsetX', xVar) } catch (e) { console.warn(`[STYLES] Bind shadow x: ${e.message}`) }
      if (yVar) try { effect = figma.variables.setBoundVariableForEffect(effect, 'offsetY', yVar) } catch (e) { console.warn(`[STYLES] Bind shadow y: ${e.message}`) }
      if (blurVar) try { effect = figma.variables.setBoundVariableForEffect(effect, 'radius', blurVar) } catch (e) { console.warn(`[STYLES] Bind shadow blur: ${e.message}`) }
      if (spreadVar) try { effect = figma.variables.setBoundVariableForEffect(effect, 'spread', spreadVar) } catch (e) { console.warn(`[STYLES] Bind shadow spread: ${e.message}`) }

      const effectStyle = figma.createEffectStyle()
      effectStyle.name = styleName
      effectStyle.effects = [effect]
      count++
    } catch (e) {
      console.error(`[STYLES] Failed to create shadow style "${styleName}": ${e.message}`)
    }
  }

  // ── Blur Styles ──
  // Group: Effects/blur/sm, Effects/blur/md, etc. (single values, not nested)
  for (const key of Object.keys(variableMap)) {
    if (!key.startsWith('Effects/blur/')) continue
    const rest = key.slice('Effects/blur/'.length) // e.g. "sm"
    if (rest.includes('/')) continue // skip if it's deeper nested

    const styleName = `Blur/blur-${rest}`
    if (existingNames.has(styleName)) {
      console.log(`[STYLES] Skipping existing blur style: ${styleName}`)
      continue
    }

    try {
      const blurVar = await figma.variables.getVariableByIdAsync(variableMap[key])
      if (!blurVar) continue
      const blurVal = await resolveVariableValue(blurVar)

      let effect = {
        type: 'LAYER_BLUR',
        radius: typeof blurVal === 'number' ? blurVal : 0,
        visible: true
      }

      try { effect = figma.variables.setBoundVariableForEffect(effect, 'radius', blurVar) } catch (e) { console.warn(`[STYLES] Bind blur radius: ${e.message}`) }

      const effectStyle = figma.createEffectStyle()
      effectStyle.name = styleName
      effectStyle.effects = [effect]
      count++
    } catch (e) {
      console.error(`[STYLES] Failed to create blur style "${styleName}": ${e.message}`)
    }
  }

  return count
}

async function generateGridStyles(variableMap, existingNames) {
  let count = 0

  // Find the Layout collection to get modes
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync()
  const layoutColl = localCollections.find(c => c.name === 'Layout')
  if (!layoutColl) return 0

  // Token paths in Layout: column/count, column/margin, column/gutter
  const countVarId = variableMap['Layout/column/count']
  const marginVarId = variableMap['Layout/column/margin']
  const gutterVarId = variableMap['Layout/column/gutter']

  if (!countVarId && !marginVarId && !gutterVarId) return 0

  const countVar = countVarId ? await figma.variables.getVariableByIdAsync(countVarId) : null
  const marginVar = marginVarId ? await figma.variables.getVariableByIdAsync(marginVarId) : null
  const gutterVar = gutterVarId ? await figma.variables.getVariableByIdAsync(gutterVarId) : null

  // Create one grid style per mode with resolved values
  for (const mode of layoutColl.modes) {
    const styleName = `Layout/layout-${mode.name}`
    if (existingNames.has(styleName)) {
      console.log(`[STYLES] Skipping existing grid style: ${styleName}`)
      continue
    }

    try {
      // Resolve values for this mode (follow alias chains to raw numbers)
      const resolvedCount = countVar ? (await resolveVariableValueForMode(countVar, mode.modeId) || 12) : 12
      const resolvedMargin = marginVar ? (await resolveVariableValueForMode(marginVar, mode.modeId) || 0) : 0
      const resolvedGutter = gutterVar ? (await resolveVariableValueForMode(gutterVar, mode.modeId) || 20) : 20

      const gridStyle = figma.createGridStyle()
      gridStyle.name = styleName

      // Create base grid object
      let layoutGrid = {
        pattern: 'COLUMNS',
        alignment: 'STRETCH',
        gutterSize: typeof resolvedGutter === 'number' ? resolvedGutter : 20,
        count: typeof resolvedCount === 'number' ? resolvedCount : 12,
        offset: typeof resolvedMargin === 'number' ? resolvedMargin : 0
      }

      // Bind variables using the layout grid helper
      if (countVar) try { layoutGrid = figma.variables.setBoundVariableForLayoutGrid(layoutGrid, 'count', countVar) } catch (e) { console.warn(`[STYLES] Bind grid count: ${e.message}`) }
      if (gutterVar) try { layoutGrid = figma.variables.setBoundVariableForLayoutGrid(layoutGrid, 'gutterSize', gutterVar) } catch (e) { console.warn(`[STYLES] Bind grid gutter: ${e.message}`) }
      if (marginVar) try { layoutGrid = figma.variables.setBoundVariableForLayoutGrid(layoutGrid, 'offset', marginVar) } catch (e) { console.warn(`[STYLES] Bind grid margin: ${e.message}`) }

      gridStyle.layoutGrids = [layoutGrid]

      count++
    } catch (e) {
      console.error(`[STYLES] Failed to create grid style "${styleName}": ${e.message}`)
    }
  }

  return count
}

async function resolveVariableValue(variable) {
  // Follows alias chains to get the actual raw value from a variable's first mode
  if (!variable || !variable.valuesByMode) return null
  const modes = Object.keys(variable.valuesByMode)
  if (modes.length === 0) return null
  return await resolveVariableValueForMode(variable, modes[0])
}

async function resolveVariableValueForMode(variable, modeId) {
  // Follows alias chains to get the actual raw value for a specific mode
  if (!variable || !variable.valuesByMode) return null
  let val = variable.valuesByMode[modeId]
  if (val === undefined) {
    // Fallback to first available mode
    const modes = Object.keys(variable.valuesByMode)
    if (modes.length === 0) return null
    val = variable.valuesByMode[modes[0]]
  }

  // Follow alias chain (max 10 hops to prevent infinite loops)
  let hops = 0
  while (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS' && hops < 10) {
    const target = await figma.variables.getVariableByIdAsync(val.id)
    if (!target || !target.valuesByMode) return null
    const targetModes = Object.keys(target.valuesByMode)
    if (targetModes.length === 0) return null
    val = target.valuesByMode[targetModes[0]]
    hops++
  }

  // If still an alias after 10 hops, give up
  if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') return null
  return val
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

async function handleExport() {
  try {
    const local = await figma.variables.getLocalVariableCollectionsAsync()

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
        const v = await figma.variables.getVariableByIdAsync(vid)
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
          const variable = await figma.variables.getVariableByIdAsync(vid)
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

async function sendCollectionsList() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync()
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
