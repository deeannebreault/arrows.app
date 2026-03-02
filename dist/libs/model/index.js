var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/reselect/lib/defaultMemoize.js
var require_defaultMemoize = __commonJS({
  "node_modules/reselect/lib/defaultMemoize.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.createCacheKeyComparator = createCacheKeyComparator;
    exports.defaultEqualityCheck = void 0;
    exports.defaultMemoize = defaultMemoize;
    var NOT_FOUND = "NOT_FOUND";
    function createSingletonCache(equals) {
      var entry;
      return {
        get: function get(key) {
          if (entry && equals(entry.key, key)) {
            return entry.value;
          }
          return NOT_FOUND;
        },
        put: function put(key, value) {
          entry = {
            key,
            value
          };
        },
        getEntries: function getEntries() {
          return entry ? [entry] : [];
        },
        clear: function clear() {
          entry = void 0;
        }
      };
    }
    function createLruCache(maxSize, equals) {
      var entries = [];
      function get(key) {
        var cacheIndex = entries.findIndex(function(entry2) {
          return equals(key, entry2.key);
        });
        if (cacheIndex > -1) {
          var entry = entries[cacheIndex];
          if (cacheIndex > 0) {
            entries.splice(cacheIndex, 1);
            entries.unshift(entry);
          }
          return entry.value;
        }
        return NOT_FOUND;
      }
      function put(key, value) {
        if (get(key) === NOT_FOUND) {
          entries.unshift({
            key,
            value
          });
          if (entries.length > maxSize) {
            entries.pop();
          }
        }
      }
      function getEntries() {
        return entries;
      }
      function clear() {
        entries = [];
      }
      return {
        get,
        put,
        getEntries,
        clear
      };
    }
    var defaultEqualityCheck = function defaultEqualityCheck2(a, b) {
      return a === b;
    };
    exports.defaultEqualityCheck = defaultEqualityCheck;
    function createCacheKeyComparator(equalityCheck) {
      return function areArgumentsShallowlyEqual(prev, next) {
        if (prev === null || next === null || prev.length !== next.length) {
          return false;
        }
        var length = prev.length;
        for (var i = 0; i < length; i++) {
          if (!equalityCheck(prev[i], next[i])) {
            return false;
          }
        }
        return true;
      };
    }
    function defaultMemoize(func, equalityCheckOrOptions) {
      var providedOptions = typeof equalityCheckOrOptions === "object" ? equalityCheckOrOptions : {
        equalityCheck: equalityCheckOrOptions
      };
      var _providedOptions$equa = providedOptions.equalityCheck, equalityCheck = _providedOptions$equa === void 0 ? defaultEqualityCheck : _providedOptions$equa, _providedOptions$maxS = providedOptions.maxSize, maxSize = _providedOptions$maxS === void 0 ? 1 : _providedOptions$maxS, resultEqualityCheck = providedOptions.resultEqualityCheck;
      var comparator = createCacheKeyComparator(equalityCheck);
      var cache = maxSize === 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator);
      function memoized() {
        var value = cache.get(arguments);
        if (value === NOT_FOUND) {
          value = func.apply(null, arguments);
          if (resultEqualityCheck) {
            var entries = cache.getEntries();
            var matchingEntry = entries.find(function(entry) {
              return resultEqualityCheck(entry.value, value);
            });
            if (matchingEntry) {
              value = matchingEntry.value;
            }
          }
          cache.put(arguments, value);
        }
        return value;
      }
      memoized.clearCache = function() {
        return cache.clear();
      };
      return memoized;
    }
  }
});

// node_modules/reselect/lib/index.js
var require_lib = __commonJS({
  "node_modules/reselect/lib/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.createSelector = void 0;
    exports.createSelectorCreator = createSelectorCreator;
    exports.createStructuredSelector = void 0;
    Object.defineProperty(exports, "defaultEqualityCheck", {
      enumerable: true,
      get: function get() {
        return _defaultMemoize.defaultEqualityCheck;
      }
    });
    Object.defineProperty(exports, "defaultMemoize", {
      enumerable: true,
      get: function get() {
        return _defaultMemoize.defaultMemoize;
      }
    });
    var _defaultMemoize = require_defaultMemoize();
    function getDependencies(funcs) {
      var dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;
      if (!dependencies.every(function(dep) {
        return typeof dep === "function";
      })) {
        var dependencyTypes = dependencies.map(function(dep) {
          return typeof dep === "function" ? "function " + (dep.name || "unnamed") + "()" : typeof dep;
        }).join(", ");
        throw new Error("createSelector expects all input-selectors to be functions, but received the following types: [" + dependencyTypes + "]");
      }
      return dependencies;
    }
    function createSelectorCreator(memoize) {
      for (var _len = arguments.length, memoizeOptionsFromArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        memoizeOptionsFromArgs[_key - 1] = arguments[_key];
      }
      var createSelector3 = function createSelector4() {
        for (var _len2 = arguments.length, funcs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          funcs[_key2] = arguments[_key2];
        }
        var _recomputations = 0;
        var _lastResult;
        var directlyPassedOptions = {
          memoizeOptions: void 0
        };
        var resultFunc = funcs.pop();
        if (typeof resultFunc === "object") {
          directlyPassedOptions = resultFunc;
          resultFunc = funcs.pop();
        }
        if (typeof resultFunc !== "function") {
          throw new Error("createSelector expects an output function after the inputs, but received: [" + typeof resultFunc + "]");
        }
        var _directlyPassedOption = directlyPassedOptions, _directlyPassedOption2 = _directlyPassedOption.memoizeOptions, memoizeOptions = _directlyPassedOption2 === void 0 ? memoizeOptionsFromArgs : _directlyPassedOption2;
        var finalMemoizeOptions = Array.isArray(memoizeOptions) ? memoizeOptions : [memoizeOptions];
        var dependencies = getDependencies(funcs);
        var memoizedResultFunc = memoize.apply(void 0, [function recomputationWrapper() {
          _recomputations++;
          return resultFunc.apply(null, arguments);
        }].concat(finalMemoizeOptions));
        var selector = memoize(function dependenciesChecker() {
          var params = [];
          var length = dependencies.length;
          for (var i = 0; i < length; i++) {
            params.push(dependencies[i].apply(null, arguments));
          }
          _lastResult = memoizedResultFunc.apply(null, params);
          return _lastResult;
        });
        Object.assign(selector, {
          resultFunc,
          memoizedResultFunc,
          dependencies,
          lastResult: function lastResult() {
            return _lastResult;
          },
          recomputations: function recomputations() {
            return _recomputations;
          },
          resetRecomputations: function resetRecomputations() {
            return _recomputations = 0;
          }
        });
        return selector;
      };
      return createSelector3;
    }
    var createSelector2 = /* @__PURE__ */ createSelectorCreator(_defaultMemoize.defaultMemoize);
    exports.createSelector = createSelector2;
    var createStructuredSelector = function createStructuredSelector2(selectors, selectorCreator) {
      if (selectorCreator === void 0) {
        selectorCreator = createSelector2;
      }
      if (typeof selectors !== "object") {
        throw new Error("createStructuredSelector expects first argument to be an object " + ("where each property is a selector, instead received a " + typeof selectors));
      }
      var objectKeys = Object.keys(selectors);
      var resultSelector = selectorCreator(
        // @ts-ignore
        objectKeys.map(function(key) {
          return selectors[key];
        }),
        function() {
          for (var _len3 = arguments.length, values = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            values[_key3] = arguments[_key3];
          }
          return values.reduce(function(composition, value, index) {
            composition[objectKeys[index]] = value;
            return composition;
          }, {});
        }
      );
      return resultSelector;
    };
    exports.createStructuredSelector = createStructuredSelector;
  }
});

// libs/model/src/lib/Node.ts
var moveTo = (node, newPosition) => {
  return {
    ...node,
    position: newPosition
  };
};
var translate = (node, vector) => moveTo(node, node.position.translate(vector));
var addLabel = (node, label) => {
  const labels = node.labels.includes(label) ? node.labels : [...node.labels, label];
  return {
    ...node,
    labels
  };
};
var renameLabel = (node, oldLabel, newLabel) => {
  const labels = [...node.labels];
  const index = labels.indexOf(oldLabel);
  if (index > -1) {
    labels[index] = newLabel;
  }
  return {
    ...node,
    labels
  };
};
var removeLabel = (node, label) => {
  const labels = [...node.labels];
  const index = labels.indexOf(label);
  if (index > -1) {
    labels.splice(index, 1);
  }
  return {
    ...node,
    labels
  };
};
var setCaption = (node, caption) => {
  return {
    ...node,
    caption
  };
};
var isNode = (entity) => entity !== null && typeof entity === "object" && Object.hasOwn(entity, "caption") && Object.hasOwn(entity, "position");

// libs/model/src/lib/styling.ts
var import_reselect = __toESM(require_lib());

// libs/model/src/lib/constants.ts
var defaultNodeRadius = 50;
var defaultRelationshipLength = 200;
var ringMargin = 10;
var relationshipHitTolerance = 20;
var defaultFontSize = 50;

// libs/model/src/lib/colors.ts
var black = "#000000";
var white = "#ffffff";
var blueGreen = "#58c8e3";
var purple = "#9bafda";
var red = "#CE0D0E";
var redActive = "#FF4C4C";
var grey = "#808080";
var selectionBorder = "#B3D7FF";
var selectionHandle = "#2284D0";

// libs/model/src/lib/fonts.ts
var googleFonts = [
  {
    fontFamily: "Nunito Sans"
  },
  {
    fontFamily: "Nunito"
  },
  {
    fontFamily: "Fira Code"
  },
  {
    fontFamily: "Bentham"
  },
  {
    fontFamily: "Kalam"
  },
  {
    fontFamily: "Caveat"
  }
];

// libs/model/src/lib/styling.ts
var hasIcon = (node, style) => !!style("node-icon-image") || !!style("relationship-icon-image");
var hasCaption = (node) => node.caption && node.caption.length > 0;
var hasLabels = (node) => node.labels && node.labels.length > 0;
var hasType = (relationship) => relationship.type && relationship.type.length > 0;
var hasProperty = (entity) => entity.properties && Object.keys(entity.properties).length > 0;
var styleFilters = {
  "Node": {
    relevantToNode: () => true
  },
  "NodeWithBorder": {
    relevantToNode: (node, style) => style("border-width") > 0
  },
  "NodeWithInsideDetail": {
    relevantToNode: (node, style) => hasIcon(node, style) && style("icon-position") === "inside" || hasCaption(node) && style("caption-position") === "inside" || hasLabels(node) && style("label-position") === "inside" || hasProperty(node) && style("property-position") === "inside"
  },
  "NodeWithOutsideDetail": {
    relevantToNode: (node, style) => hasIcon(node, style) && style("icon-position") === "outside" || hasCaption(node) && style("caption-position") === "outside" || hasLabels(node) && style("label-position") === "outside" || hasProperty(node) && style("property-position") === "outside"
  },
  "NodeWithIcon": {
    relevantToNode: hasIcon
  },
  "NodeOrRelationshipWithIcon": {
    relevantToNode: hasIcon,
    relevantToRelationship: hasIcon
  },
  "NodeWithCaption": {
    relevantToNode: hasCaption
  },
  "NodeWithCaptionOutside": {
    relevantToNode: (node, style) => hasCaption(node) && style("caption-position") === "outside"
  },
  "NodeWithLabel": {
    relevantToNode: hasLabels
  },
  "Relationship": {
    relevantToRelationship: () => true
  },
  "RelationshipWithDetail": {
    relevantToRelationship: (relationship) => hasType(relationship) || hasProperty(relationship)
  },
  "RelationshipWithType": {
    relevantToRelationship: hasType
  },
  "NodeOrRelationshipWithProperty": {
    relevantToNode: hasProperty,
    relevantToRelationship: hasProperty
  }
};
var graphStyleSelector = (graph) => graph.style || {};
var specificOrGeneral = (styleKey, entity, graphStyle) => {
  if (entity.style && Object.hasOwn(entity.style, styleKey)) {
    return entity.style[styleKey];
  }
  return graphStyle[styleKey];
};
var getStyleSelector = (entity, styleKey) => (0, import_reselect.createSelector)(
  graphStyleSelector,
  (graphStyle) => validate(styleKey, specificOrGeneral(styleKey, entity, graphStyle))
);
var categoriesPresent = (nodes, relationships, graph) => {
  const categories = [];
  nodes.forEach((node) => {
    const style = (styleAttribute) => getStyleSelector(node, styleAttribute)(graph);
    for (const [category, filter] of Object.entries(styleFilters)) {
      if ("relevantToNode" in filter && filter.relevantToNode(node, style)) {
        categories.push(category);
      }
    }
  });
  relationships.forEach((relationship) => {
    const style = (styleAttribute) => getStyleSelector(relationship, styleAttribute)(graph);
    for (const [category, filter] of Object.entries(styleFilters)) {
      if ("relevantToRelationship" in filter && filter.relevantToRelationship(relationship, style)) {
        categories.push(category);
      }
    }
  });
  return categories;
};
var styleAttributeGroups = [
  {
    name: "General",
    entityTypes: ["node", "relationship"],
    attributes: [
      { key: "font-family", appliesTo: "Everything", type: "font-family", defaultValue: "sans-serif" },
      { key: "background-color", appliesTo: "Everything", type: "color", defaultValue: white },
      { key: "background-image", appliesTo: "Everything", type: "image", defaultValue: "" },
      { key: "background-size", appliesTo: "Everything", type: "percentage", defaultValue: "100%" }
    ]
  },
  {
    name: "Nodes",
    entityTypes: ["node"],
    attributes: [
      { key: "node-color", appliesTo: "Node", type: "color", defaultValue: white },
      { key: "border-width", appliesTo: "Node", type: "line-width", defaultValue: 4 },
      { key: "border-color", appliesTo: "NodeWithBorder", type: "color", defaultValue: black },
      { key: "radius", appliesTo: "Node", type: "radius", defaultValue: defaultNodeRadius },
      { key: "node-padding", appliesTo: "NodeWithInsideDetail", type: "spacing", defaultValue: 5 },
      { key: "node-margin", appliesTo: "NodeWithOutsideDetail", type: "spacing", defaultValue: 2 },
      { key: "outside-position", appliesTo: "NodeWithOutsideDetail", type: "outside-position", defaultValue: "auto" },
      { key: "node-icon-image", appliesTo: "Node", type: "image", defaultValue: "" },
      { key: "node-background-image", appliesTo: "Node", type: "image", defaultValue: "" }
    ]
  },
  {
    name: "Icons",
    entityTypes: ["node"],
    attributes: [
      { key: "icon-position", appliesTo: "NodeWithIcon", type: "inside-outside", defaultValue: "inside" },
      { key: "icon-size", appliesTo: "NodeOrRelationshipWithIcon", type: "radius", defaultValue: 64 }
    ]
  },
  {
    name: "Node Captions",
    entityTypes: ["node"],
    attributes: [
      { key: "caption-position", appliesTo: "NodeWithCaption", type: "inside-outside", defaultValue: "inside" },
      { key: "caption-max-width", appliesTo: "NodeWithCaptionOutside", type: "radius", defaultValue: 200 },
      { key: "caption-color", appliesTo: "NodeWithCaption", type: "color", defaultValue: black },
      { key: "caption-font-size", appliesTo: "NodeWithCaption", type: "font-size", defaultValue: defaultFontSize },
      { key: "caption-font-weight", appliesTo: "NodeWithCaption", type: "font-weight", defaultValue: "normal" }
    ]
  },
  {
    name: "Node Labels",
    entityTypes: ["node"],
    attributes: [
      { key: "label-position", appliesTo: "NodeWithLabel", type: "inside-outside", defaultValue: "inside" },
      { key: "label-display", appliesTo: "NodeWithLabel", type: "label-display", defaultValue: "pill" },
      { key: "label-color", appliesTo: "NodeWithLabel", type: "color", defaultValue: black },
      { key: "label-background-color", appliesTo: "NodeWithLabel", type: "color", defaultValue: white },
      { key: "label-border-color", appliesTo: "NodeWithLabel", type: "color", defaultValue: black },
      { key: "label-border-width", appliesTo: "NodeWithLabel", type: "line-width", defaultValue: 4 },
      { key: "label-font-size", appliesTo: "NodeWithLabel", type: "font-size", defaultValue: defaultFontSize * (4 / 5) },
      { key: "label-padding", appliesTo: "NodeWithLabel", type: "spacing", defaultValue: 5 },
      { key: "label-margin", appliesTo: "NodeWithLabel", type: "spacing", defaultValue: 4 }
    ]
  },
  {
    name: "Arrows",
    entityTypes: ["relationship"],
    attributes: [
      { key: "directionality", appliesTo: "Relationship", type: "directionality", defaultValue: "directed" },
      { key: "detail-position", appliesTo: "RelationshipWithDetail", type: "detail-position", defaultValue: "inline" },
      { key: "detail-orientation", appliesTo: "RelationshipWithDetail", type: "orientation", defaultValue: "parallel" },
      { key: "arrow-width", appliesTo: "Relationship", type: "line-width", defaultValue: 5 },
      { key: "arrow-color", appliesTo: "Relationship", type: "color", defaultValue: black },
      { key: "margin-start", appliesTo: "Relationship", type: "spacing", defaultValue: 5 },
      { key: "margin-end", appliesTo: "Relationship", type: "spacing", defaultValue: 5 },
      { key: "margin-peer", appliesTo: "Relationship", type: "spacing", defaultValue: 20 },
      { key: "attachment-start", appliesTo: "Relationship", type: "attachment", defaultValue: "normal" },
      { key: "attachment-end", appliesTo: "Relationship", type: "attachment", defaultValue: "normal" },
      { key: "relationship-icon-image", appliesTo: "Relationship", type: "image", defaultValue: "" }
    ]
  },
  {
    name: "Relationship Types",
    entityTypes: ["relationship"],
    attributes: [
      { key: "type-color", appliesTo: "RelationshipWithType", type: "color", defaultValue: black },
      { key: "type-background-color", appliesTo: "RelationshipWithType", type: "color", defaultValue: white },
      { key: "type-border-color", appliesTo: "RelationshipWithType", type: "color", defaultValue: black },
      { key: "type-border-width", appliesTo: "RelationshipWithType", type: "line-width", defaultValue: 0 },
      { key: "type-font-size", appliesTo: "RelationshipWithType", type: "font-size", defaultValue: 16 },
      { key: "type-padding", appliesTo: "RelationshipWithType", type: "spacing", defaultValue: 5 }
    ]
  },
  {
    name: "Properties",
    entityTypes: ["node", "relationship"],
    attributes: [
      { key: "property-position", appliesTo: "NodeOrRelationshipWithProperty", type: "inside-outside", defaultValue: "outside" },
      { key: "property-alignment", appliesTo: "NodeOrRelationshipWithProperty", type: "property-alignment", defaultValue: "colon" },
      { key: "property-color", appliesTo: "NodeOrRelationshipWithProperty", type: "color", defaultValue: black },
      { key: "property-font-size", appliesTo: "NodeOrRelationshipWithProperty", type: "font-size", defaultValue: 16 },
      { key: "property-font-weight", appliesTo: "NodeOrRelationshipWithProperty", type: "font-weight", defaultValue: "normal" }
    ]
  }
];
var styleAttributes = Object.fromEntries(
  styleAttributeGroups.flatMap((group) => group.attributes).map((attribute) => [attribute.key, attribute])
);
var nodeStyleAttributes = styleAttributeGroups.filter((group) => group.entityTypes.includes("node")).flatMap((group) => group.attributes).map((attribute) => attribute.key);
var relationshipStyleAttributes = styleAttributeGroups.filter((group) => group.entityTypes.includes("relationship")).flatMap((group) => group.attributes).map((attribute) => attribute.key);
var imageAttributes = styleAttributeGroups.flatMap((group) => group.attributes).filter((attribute) => attribute.type === "image").map((attribute) => attribute.key);
var styleTypes = {
  "radius": { editor: "slider", min: 1, max: 1e3, step: 5 },
  "line-width": { editor: "slider", min: 0, max: 25, step: 1 },
  "spacing": { editor: "slider", min: 0, max: 50, step: 1 },
  "font-size": { editor: "slider", min: 5, max: 100, step: 1 },
  "color": { editor: "colorPicker" },
  "font-family": { editor: "dropdown", options: ["sans-serif", ...googleFonts.map((font) => font.fontFamily)] },
  "font-weight": { editor: "dropdown", options: ["normal", "bold"] },
  "directionality": { editor: "dropdown", options: ["directed", "undirected"] },
  "outside-position": { editor: "dropdown", options: ["auto", "top-left", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left"] },
  "inside-outside": { editor: "dropdown", options: ["inside", "outside"] },
  "detail-position": { editor: "dropdown", options: ["inline", "above", "below"] },
  "orientation": { editor: "dropdown", options: ["parallel", "perpendicular", "horizontal"] },
  "property-alignment": { editor: "dropdown", options: ["colon", "center"] },
  "label-display": { editor: "dropdown", options: ["pill", "bare"] },
  "attachment": { editor: "dropdown", options: ["normal", "top", "right", "bottom", "left"] },
  "image": { editor: "imageUrl" },
  "percentage": { editor: "percentageSlider", min: 5, max: 1e3, step: 5 }
};
var completeWithDefaults = (style) => {
  const completeStyle = {};
  Object.keys(styleAttributes).forEach((key) => {
    if (Object.hasOwn(style, key)) {
      completeStyle[key] = style[key];
    } else {
      completeStyle[key] = styleAttributes[key].defaultValue;
    }
  });
  return completeStyle;
};
var validate = (styleKey, value) => {
  const styleAttribute = styleAttributes[styleKey];
  const styleType = styleTypes[styleAttribute.type];
  switch (styleType.editor) {
    case "slider":
    case "percentageSlider":
      if (!isNaN(value)) {
        if (value < styleType.min) {
          return styleType.min;
        }
        if (value > styleType.max) {
          return styleType.max;
        }
        return value;
      }
      break;
    case "colorPicker":
      if (/^#[0-9A-F]{6}$/i.test(value)) {
        return value;
      }
      break;
    case "dropdown":
      if (styleType.options.includes(value)) {
        return value;
      }
      break;
    case "imageUrl":
      return value;
  }
  return styleAttribute.defaultValue;
};

// libs/model/src/lib/Relationship.ts
var setType = (relationship, type) => {
  return {
    id: relationship.id,
    type,
    style: relationship.style,
    properties: relationship.properties,
    fromId: relationship.fromId,
    toId: relationship.toId
  };
};
var stringTypeToDatabaseType = (stringType) => {
  return stringType === "" ? "_RELATED" : stringType.replace(/_/g, "__");
};
var databaseTypeToStringType = (databaseType) => {
  return databaseType === "_RELATED" ? "" : databaseType.replace(/__/g, "_");
};
var reverse = (relationship) => {
  return {
    id: relationship.id,
    type: relationship.type,
    style: relationship.style,
    properties: relationship.properties,
    toId: relationship.fromId,
    fromId: relationship.toId
  };
};
var isRelationship = (entity) => entity !== void 0 && typeof entity === "object" && Object.hasOwn(entity, "type") && Object.hasOwn(entity, "fromId") && Object.hasOwn(entity, "toId");
var otherNodeId = (relationship, nodeId) => {
  if (relationship.fromId === nodeId) {
    return relationship.toId;
  }
  if (relationship.toId === nodeId) {
    return relationship.fromId;
  }
  return void 0;
};

// libs/model/src/lib/properties.ts
var indexablePropertyText = (entity) => {
  return Object.keys(entity.properties).map((key) => `${key} ${entity.properties[key]}`);
};

// libs/model/src/lib/Id.ts
function asKey(id) {
  return id;
}
function idsMatch(a, b) {
  return a === b;
}
function nextId(id) {
  return "n" + (parseInt(id.substring(1)) + 1);
}
function nextAvailableId(entities, prefix = "n") {
  const currentIds = entities.map((entity) => entity.id).filter((id) => new RegExp(`^${prefix}[0-9]+$`).test(id)).map((id) => parseInt(id.substring(1))).sort((x, y) => x - y);
  return prefix + (currentIds.length > 0 ? currentIds.pop() + 1 : 0);
}

// libs/model/src/lib/Vector.ts
var Vector = class {
  constructor(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }
  plus(otherVector) {
    return new Vector(this.dx + otherVector.dx, this.dy + otherVector.dy);
  }
  minus(otherVector) {
    return new Vector(this.dx - otherVector.dx, this.dy - otherVector.dy);
  }
  scale(scaleFactor) {
    return new Vector(this.dx * scaleFactor, this.dy * scaleFactor);
  }
  dot(vector) {
    return this.dx * vector.dx + this.dy * vector.dy;
  }
  invert() {
    return new Vector(-this.dx, -this.dy);
  }
  rotate(angle) {
    return new Vector(
      this.dx * Math.cos(angle) - this.dy * Math.sin(angle),
      this.dx * Math.sin(angle) + this.dy * Math.cos(angle)
    );
  }
  perpendicular() {
    return new Vector(-this.dy, this.dx);
  }
  distance() {
    return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
  }
  unit() {
    return this.scale(1 / this.distance());
  }
  angle() {
    return Math.atan2(this.dy, this.dx);
  }
  get dxdy() {
    return [this.dx, this.dy];
  }
  asCSSTransform() {
    return `translate(${this.dx}px,${this.dy}px)`;
  }
};

// libs/model/src/lib/Point.ts
var Point = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  vectorFrom(otherPoint) {
    return new Vector(this.x - otherPoint.x, this.y - otherPoint.y);
  }
  vectorFromOrigin() {
    return new Vector(this.x, this.y);
  }
  scale(scaleFactor) {
    return new Point(this.x * scaleFactor, this.y * scaleFactor);
  }
  translate(vector) {
    return new Point(this.x + vector.dx, this.y + vector.dy);
  }
  rotate(angle) {
    return new Point(
      this.x * Math.cos(angle) - this.y * Math.sin(angle),
      this.x * Math.sin(angle) + this.y * Math.cos(angle)
    );
  }
  isEqual(point) {
    return this.x === point.x && this.y === point.y;
  }
  get xy() {
    return [this.x, this.y];
  }
};
var originPoint = new Point(0, 0);
var average = (points) => {
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  return new Point(sumX / points.length, sumY / points.length);
};

// libs/model/src/lib/Graph.ts
var emptyGraph = () => {
  return {
    nodes: [{
      entityType: "Node",
      status: "",
      id: nextAvailableId([]),
      position: new Point(0, 0),
      caption: "",
      style: {},
      labels: [],
      properties: {}
    }],
    relationships: [],
    style: completeWithDefaults({})
  };
};
var getNodeIdMap = (graph) => graph.nodes.reduce((nodeIdMap, node) => {
  nodeIdMap[node.id] = node;
  return nodeIdMap;
}, {});
var indexableText = (graph) => {
  const lines = [];
  graph.nodes.forEach((node) => {
    lines.push(node.caption);
    lines.push(...indexablePropertyText(node));
  });
  graph.relationships.forEach((relationship) => {
    lines.push(relationship.type);
    lines.push(...indexablePropertyText(relationship));
  });
  const text = lines.join("\n");
  return text.substr(0, 128e3);
};
var addUsedCodePoints = (set, s) => {
  for (const char of s) {
    set.add(char.codePointAt(0));
  }
};
var usedCodePoints = (graph) => {
  const codePoints = /* @__PURE__ */ new Set();
  graph.nodes.forEach((node) => {
    addUsedCodePoints(codePoints, node.caption);
    for (const [key, value] of Object.entries(node.properties)) {
      addUsedCodePoints(codePoints, key);
      addUsedCodePoints(codePoints, value);
    }
  });
  graph.relationships.forEach((relationship) => {
    addUsedCodePoints(codePoints, relationship.type);
    for (const [key, value] of Object.entries(relationship.properties)) {
      addUsedCodePoints(codePoints, key);
      addUsedCodePoints(codePoints, value);
    }
  });
  return codePoints;
};
var neighbourPositions = (node, graph) => {
  return graph.relationships.filter((relationship) => node.id === relationship.fromId || node.id === relationship.toId).filter((relationship) => relationship.fromId !== relationship.toId).map((relationship) => {
    const otherId = otherNodeId(relationship, node.id);
    const otherNode = graph.nodes.find((otherNode2) => otherNode2.id === otherId);
    return otherNode.position;
  });
};
var graphsDifferInMoreThanPositions = (graph1, graph2) => {
  return nodesDifferInMoreThanPositions(graph1.nodes, graph2.nodes) || graph1.relationships !== graph2.relationships || graph1.style !== graph2.style;
};
var nodesDifferInMoreThanPositions = (nodes1, nodes2) => {
  if (nodes1.length !== nodes2.length)
    return true;
  return nodes1.some((node1, i) => {
    const node2 = nodes2[i];
    return node1.id !== node2.id || node1.caption !== node2.caption || node1.style !== node2.style || node1.labels !== node2.labels || node1.properties !== node2.properties;
  });
};

// libs/model/src/lib/ViewTransformation.ts
var ViewTransformation = class {
  scale;
  offset;
  constructor(scale = 1, offset = new Vector(0, 0)) {
    this.scale = scale;
    this.offset = offset;
  }
  zoom(scale) {
    return new ViewTransformation(scale, this.offset);
  }
  scroll(vector) {
    return new ViewTransformation(this.scale, this.offset.plus(vector));
  }
  transform(point) {
    return point.scale(this.scale).translate(this.offset);
  }
  inverse(point) {
    return point.translate(this.offset.invert()).scale(1 / this.scale);
  }
  adjust(scale, panX, panY) {
    return new ViewTransformation(scale, new Vector(panX, panY));
  }
  asCSSTransform() {
    return `${this.offset.asCSSTransform()} scale(${this.scale})`;
  }
};

// libs/model/src/lib/applicationLayout.ts
var headerHeight = 40;
var footerHeight = 30;
var inspectorWidth = 425;
var canvasPadding = 50;
var computeCanvasSize = (applicationLayout) => {
  const { windowSize, inspectorVisible } = applicationLayout;
  return {
    width: windowSize.width - (inspectorVisible ? inspectorWidth : 0),
    height: windowSize.height - headerHeight - footerHeight - 2
  };
};
var subtractPadding = (canvasSize) => {
  return {
    width: canvasSize.width - canvasPadding * 2,
    height: canvasSize.height - canvasPadding * 2
  };
};

// libs/model/src/lib/selection.ts
var selectedNodeIds = (selection) => {
  return selection.entities.filter((entity) => entity.entityType === "node").map((entity) => entity.id);
};
var selectedNodeIdMap = (selection) => {
  const idMap = {};
  selection.entities.filter((entity) => entity.entityType === "node").forEach((entity) => {
    idMap[entity.id] = true;
  });
  return idMap;
};
var nodeSelected = (selection, nodeId) => {
  return selection.entities.some(
    (entity) => entity.entityType === "node" && entity.id === nodeId
  );
};
var nodeEditing = (selection, nodeId) => {
  return selection.editing && selection.editing.entityType === "node" && selection.editing.id === nodeId;
};
var selectedNodes = (graph, selection) => {
  return graph.nodes.filter(
    (node) => selection.entities.some(
      (entity) => entity.entityType === "node" && entity.id === node.id
    )
  );
};
var selectedRelationshipIds = (selection) => {
  return selection.entities.filter((entity) => entity.entityType === "relationship").map((entity) => entity.id);
};
var selectedRelationshipIdMap = (selection) => {
  const idMap = {};
  selection.entities.filter((entity) => entity.entityType === "relationship").forEach((entity) => {
    idMap[entity.id] = true;
  });
  return idMap;
};
var relationshipSelected = (selection, relationshipId) => {
  return selection.entities.some(
    (entity) => entity.entityType === "relationship" && entity.id === relationshipId
  );
};
var relationshipEditing = (selection, relationshipId) => {
  return selection.editing && selection.editing.entityType === "relationship" && selection.editing.id === relationshipId;
};
var selectedRelationships = (graph, selection) => {
  return graph.relationships.filter(
    (node) => selection.entities.some(
      (entity) => entity.entityType === "relationship" && entity.id === node.id
    )
  );
};

// libs/model/src/lib/attachments.ts
var attachmentOptions = [
  { name: "top", angle: -Math.PI / 2 },
  { name: "right", angle: 0 },
  { name: "bottom", angle: Math.PI / 2 },
  { name: "left", angle: Math.PI }
];

// libs/model/src/lib/themes.ts
var themes = [
  {
    name: "Chunky",
    description: "For simple, bold diagrams.",
    graph: {
      "nodes": [
        {
          "id": "n0",
          "entityType": "node",
          "position": new Point(-52, 0),
          // {
          //   "x": -52,
          //   "y": 0
          // },
          "caption": "a",
          "style": {},
          "labels": [],
          "properties": {}
        },
        {
          "id": "n1",
          "entityType": "node",
          "position": new Point(309.5734899055742, 0),
          // {
          //   "x": 309.5734899055742,
          //   "y": 0
          // },
          "caption": "b",
          "style": {},
          "labels": [],
          "properties": {}
        }
      ],
      "relationships": [
        {
          "id": "n0",
          "entityType": "relationship",
          "type": "KNOWS",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n1"
        }
      ],
      "style": {
        "font-family": "sans-serif",
        "background-color": "#ffffff",
        "node-color": "#ffffff",
        "border-width": 4,
        "border-color": "#000000",
        "radius": 50,
        "node-padding": 5,
        "outside-position": "auto",
        "node-icon-image": "",
        "node-background-image": "",
        "icon-position": "inside",
        "icon-size": 64,
        "caption-position": "inside",
        "caption-max-width": 200,
        "caption-color": "#000000",
        "caption-font-size": 50,
        "caption-font-weight": "normal",
        "label-position": "inside",
        "label-display": "pill",
        "label-color": "#000000",
        "label-background-color": "#ffffff",
        "label-border-color": "#000000",
        "label-border-width": 4,
        "label-font-size": 40,
        "label-padding": 5,
        "label-margin": 4,
        "directionality": "directed",
        "detail-position": "inline",
        "detail-orientation": "parallel",
        "arrow-width": 5,
        "arrow-color": "#000000",
        "margin-start": 5,
        "margin-end": 5,
        "margin-peer": 20,
        "attachment-start": "normal",
        "attachment-end": "normal",
        "relationship-icon-image": "",
        "type-color": "#000000",
        "type-background-color": "#ffffff",
        "type-border-color": "#000000",
        "type-border-width": 0,
        "type-font-size": 16,
        "type-padding": 5,
        "property-position": "outside",
        "property-color": "#000000",
        "property-font-size": 16,
        "property-font-weight": "normal"
      }
    }
  },
  {
    name: "Dark Code",
    description: "Light-on-dark contrast similar to an IDE",
    graph: {
      "style": {
        "font-family": "Fira Code",
        "background-color": "#2B2B2B",
        "node-color": "#2B2B2B",
        "border-width": 2,
        "border-color": "#A6B7C8",
        "radius": 90,
        "node-padding": 5,
        "node-margin": 2,
        "outside-position": "auto",
        "node-icon-image": "",
        "node-background-image": "",
        "icon-position": "inside",
        "icon-size": 64,
        "caption-position": "inside",
        "caption-max-width": 200,
        "caption-color": "#A6B7C8",
        "caption-font-size": 18,
        "caption-font-weight": "normal",
        "label-position": "inside",
        "label-display": "bare",
        "label-color": "#A6B7C8",
        "label-background-color": "#ffffff",
        "label-border-color": "#000000",
        "label-border-width": 4,
        "label-font-size": 18,
        "label-padding": 5,
        "label-margin": 4,
        "directionality": "directed",
        "detail-position": "inline",
        "detail-orientation": "parallel",
        "arrow-width": 2,
        "arrow-color": "#A6B7C8",
        "margin-start": 0,
        "margin-end": 0,
        "margin-peer": 20,
        "attachment-start": "normal",
        "attachment-end": "normal",
        "relationship-icon-image": "",
        "type-color": "#A6B7C8",
        "type-background-color": "#2B2B2B",
        "type-border-color": "#000000",
        "type-border-width": 0,
        "type-font-size": 18,
        "type-padding": 5,
        "property-position": "inside",
        "property-alignment": "colon",
        "property-color": "#A6B7C8",
        "property-font-size": 18,
        "property-font-weight": "normal"
      },
      "nodes": [
        {
          "id": "n0",
          "entityType": "node",
          "position": new Point(11.499999999999986, -74.54584527220625),
          // {
          //   "x": 11.499999999999986,
          //   "y": -74.54584527220625
          // },
          "caption": "",
          "labels": [
            "Product"
          ],
          "properties": {
            "SKU": "750045",
            "unit": "100"
          },
          "style": {}
        },
        {
          "id": "n1",
          "entityType": "node",
          "position": new Point(381.4169054441258, -74.54584527220625),
          // {
          //   "x": 381.4169054441258,
          //   "y": -74.54584527220625
          // },
          "caption": "",
          "labels": [
            "Category"
          ],
          "properties": {
            "stock": "true"
          },
          "style": {}
        }
      ],
      "relationships": [
        {
          "id": "n0",
          "entityType": "relationship",
          "type": "CATEGORY",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n1"
        }
      ]
    }
  },
  {
    name: "Bloom",
    description: "Theme based on Neo4j Bloom.",
    graph: {
      "style": {
        "font-family": "Nunito Sans",
        "background-color": "#F2F2F2",
        "node-color": "#4C8EDA",
        "border-width": 0,
        "border-color": "#000000",
        "radius": 75,
        "node-padding": 5,
        "outside-position": "auto",
        "node-icon-image": "",
        "node-background-image": "",
        "icon-position": "inside",
        "icon-size": 64,
        "caption-position": "inside",
        "caption-max-width": 200,
        "caption-color": "#ffffff",
        "caption-font-size": 20,
        "caption-font-weight": "normal",
        "label-position": "inside",
        "label-display": "bare",
        "label-color": "#ffffff",
        "label-background-color": "#848484",
        "label-border-color": "#848484",
        "label-border-width": 3,
        "label-font-size": 20,
        "label-padding": 5,
        "label-margin": 4,
        "directionality": "directed",
        "detail-position": "above",
        "detail-orientation": "parallel",
        "arrow-width": 3,
        "arrow-color": "#848484",
        "margin-start": 5,
        "margin-end": 5,
        "margin-peer": 20,
        "attachment-start": "normal",
        "attachment-end": "normal",
        "relationship-icon-image": "",
        "type-color": "#848484",
        "type-background-color": "#F2F2F2",
        "type-border-color": "#848484",
        "type-border-width": 0,
        "type-font-size": 21,
        "type-padding": 5,
        "property-position": "outside",
        "property-color": "#848484",
        "property-font-size": 20,
        "property-font-weight": "normal"
      },
      "nodes": [
        {
          "id": "n0",
          "entityType": "node",
          "position": new Point(-108, 0),
          // {
          //   "x": -108,
          //   "y": 0
          // },
          "caption": "Liv Tyler",
          "style": {
            "node-color": "#F79767"
          },
          "labels": [],
          "properties": {}
        },
        {
          "id": "n1",
          "entityType": "node",
          "position": new Point(309.5734899055742, 0),
          // {
          //   "x": 309.5734899055742,
          //   "y": 0
          // },
          "caption": "That thing you do",
          "style": {},
          "labels": [],
          "properties": {}
        }
      ],
      "relationships": [
        {
          "id": "n0",
          "entityType": "relationship",
          "type": "ACTED IN",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n1"
        }
      ]
    }
  },
  {
    name: "Browser",
    description: "Theme based on Neo4j Browser",
    graph: {
      "style": {
        "font-family": "sans-serif",
        "background-color": "#FAFCFF",
        "node-color": "#4C8EDA",
        "border-width": 2,
        "border-color": "#2870c2",
        "radius": 25,
        "node-padding": 5,
        "outside-position": "auto",
        "node-icon-image": "",
        "node-background-image": "",
        "icon-position": "inside",
        "icon-size": 64,
        "caption-position": "inside",
        "caption-max-width": 200,
        "caption-color": "#ffffff",
        "caption-font-size": 10,
        "caption-font-weight": "normal",
        "label-position": "outside",
        "label-display": "bare",
        "label-color": "#ffffff",
        "label-background-color": "#4C8EDA",
        "label-border-color": "#4C8EDA",
        "label-border-width": 0,
        "label-font-size": 10,
        "label-padding": 2,
        "label-margin": 2,
        "directionality": "directed",
        "detail-position": "inline",
        "detail-orientation": "parallel",
        "arrow-width": 1,
        "arrow-color": "#A5ABB6",
        "margin-start": 0,
        "margin-end": 0,
        "margin-peer": 20,
        "attachment-start": "normal",
        "attachment-end": "normal",
        "relationship-icon-image": "",
        "type-color": "#000000",
        "type-background-color": "#ffffff",
        "type-border-color": "#000000",
        "type-border-width": 0,
        "type-font-size": 10,
        "type-padding": 2,
        "property-position": "outside",
        "property-color": "#000000",
        "property-font-size": 10,
        "property-font-weight": "normal"
      },
      "nodes": [
        {
          "id": "n0",
          "entityType": "node",
          "position": new Point(3.8854047888817544, 0),
          // {
          //   "x": 3.8854047888817544,
          //   "y": 0
          // },
          "caption": "Tom Hanks",
          "style": {
            "node-color": "#F79767",
            "border-color": "#f36924"
          },
          "labels": [],
          "properties": {}
        },
        {
          "id": "n1",
          "entityType": "node",
          "position": new Point(144.87486013982567, 0),
          // {
          //   "x": 144.87486013982567,
          //   "y": 0
          // },
          "caption": "The Da Vinci Code",
          "style": {},
          "labels": [
            "Movie"
          ],
          "properties": {
            "released": "2006",
            "tagline": "Break The Codes",
            "title": "The Da Vinci Code"
          }
        }
      ],
      "relationships": [
        {
          "id": "n0",
          "entityType": "relationship",
          "type": "ACTED_IN",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n1"
        }
      ]
    }
  },
  {
    name: "Iconic",
    description: "Minimal undirected graphs suitable for very small pictures",
    graph: {
      "style": {
        "font-family": "sans-serif",
        "background-color": "#ffffff",
        "node-color": "#ffffff",
        "border-width": 2,
        "border-color": "#000000",
        "radius": 10,
        "node-padding": 5,
        "outside-position": "auto",
        "node-icon-image": "",
        "node-background-image": "",
        "icon-position": "inside",
        "icon-size": 64,
        "caption-position": "outside",
        "caption-max-width": 200,
        "caption-color": "#000000",
        "caption-font-size": 10,
        "caption-font-weight": "normal",
        "label-position": "outside",
        "label-display": "pill",
        "label-color": "#000000",
        "label-background-color": "#ffffff",
        "label-border-color": "#000000",
        "label-border-width": 2,
        "label-font-size": 10,
        "label-padding": 1,
        "label-margin": 4,
        "directionality": "undirected",
        "detail-position": "inline",
        "detail-orientation": "parallel",
        "arrow-width": 2,
        "arrow-color": "#000000",
        "margin-start": 0,
        "margin-end": 0,
        "margin-peer": 20,
        "attachment-start": "normal",
        "attachment-end": "normal",
        "relationship-icon-image": "",
        "type-color": "#000000",
        "type-background-color": "#ffffff",
        "type-border-color": "#000000",
        "type-border-width": 0,
        "type-font-size": 10,
        "type-padding": 5,
        "property-position": "outside",
        "property-color": "#000000",
        "property-font-size": 10,
        "property-font-weight": "normal"
      },
      "nodes": [
        {
          "id": "n0",
          "entityType": "node",
          "position": new Point(-16.5, 0),
          // {
          //   "x": -16.5,
          //   "y": 0
          // },
          "caption": "",
          "style": {
            "node-color": "#7b64ff"
          },
          "labels": [],
          "properties": {}
        },
        {
          "id": "n1",
          "entityType": "node",
          "position": new Point(-39.78102752569192, 40.6310118348138),
          // {
          //   "x": -39.78102752569192,
          //   "y": 40.6310118348138
          // },
          "caption": "",
          "style": {},
          "labels": [],
          "properties": {}
        },
        {
          "id": "n2",
          "entityType": "node",
          "position": new Point(6.781027525691918, 40.6310118348138),
          // {
          //   "x": 6.781027525691918,
          //   "y": 40.6310118348138
          // },
          "caption": "",
          "style": {},
          "labels": [],
          "properties": {}
        },
        {
          "id": "n3",
          "entityType": "node",
          "position": new Point(-39.78102752569192, -40.631011834813805),
          // {
          //   "x": -39.78102752569192,
          //   "y": -40.631011834813805
          // },
          "caption": "",
          "style": {
            "node-color": "#fcdc00"
          },
          "labels": [],
          "properties": {}
        },
        {
          "id": "n4",
          "entityType": "node",
          "position": new Point(-63.32825392188784, 0),
          // {
          //   "x": -63.32825392188784,
          //   "y": 0
          // },
          "caption": "",
          "style": {},
          "labels": [],
          "properties": {}
        },
        {
          "id": "n5",
          "entityType": "node",
          "position": new Point(30.328253921887843, 0),
          // {
          //   "x": 30.328253921887843,
          //   "y": 0
          // },
          "caption": "",
          "style": {},
          "labels": [],
          "properties": {}
        },
        {
          "id": "n6",
          "entityType": "node",
          "position": new Point(6.781027525691918, -40.631011834813805),
          // {
          //   "x": 6.781027525691918,
          //   "y": -40.631011834813805
          // },
          "caption": "",
          "style": {},
          "labels": [],
          "properties": {}
        },
        {
          "id": "n7",
          "entityType": "node",
          "position": new Point(53.609281447579775, 40.6310118348138),
          // {
          //   "x": 53.609281447579775,
          //   "y": 40.6310118348138
          // },
          "caption": "",
          "style": {
            "node-color": "#c45100"
          },
          "labels": [],
          "properties": {}
        }
      ],
      "relationships": [
        {
          "id": "n0",
          "entityType": "relationship",
          "type": "",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n1"
        },
        {
          "id": "n1",
          "entityType": "relationship",
          "type": "",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n2"
        },
        {
          "id": "n2",
          "entityType": "relationship",
          "type": "",
          "style": {},
          "properties": {},
          "fromId": "n1",
          "toId": "n2"
        },
        {
          "id": "n3",
          "entityType": "relationship",
          "type": "",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n3"
        },
        {
          "id": "n4",
          "entityType": "relationship",
          "type": "",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n4"
        },
        {
          "id": "n5",
          "entityType": "relationship",
          "type": "",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n5"
        },
        {
          "id": "n6",
          "entityType": "relationship",
          "type": "",
          "style": {},
          "properties": {},
          "fromId": "n0",
          "toId": "n6"
        },
        {
          "id": "n7",
          "entityType": "relationship",
          "type": "",
          "style": {},
          "properties": {},
          "fromId": "n5",
          "toId": "n7"
        },
        {
          "id": "n8",
          "entityType": "relationship",
          "type": "",
          "style": {},
          "properties": {},
          "fromId": "n4",
          "toId": "n1"
        }
      ]
    }
  }
];

// libs/model/src/lib/guides/intersections.ts
var isVertical = (line) => {
  return Math.abs(Math.PI / 2 - Math.abs(line.angle)) < 0.01;
};
var intersectVertical = (vertical, other) => {
  return {
    possible: true,
    intersection: new Point(
      vertical.center.x,
      Math.tan(other.angle) * (vertical.center.x - other.center.x) + other.center.y
    )
  };
};
var areParallel = (lineA, lineB) => {
  return Math.abs((lineA.angle - lineB.angle) % Math.PI) < 0.01;
};
var intersectLineAndLine = (lineA, lineB) => {
  if (areParallel(lineA, lineB)) {
    return {
      possible: false
    };
  }
  if (isVertical(lineA)) {
    return intersectVertical(lineA, lineB);
  }
  if (isVertical(lineB)) {
    return intersectVertical(lineB, lineA);
  }
  const mA = Math.tan(lineA.angle);
  const mB = Math.tan(lineB.angle);
  const x = (mA * lineA.center.x - mB * lineB.center.x - (lineA.center.y - lineB.center.y)) / (mA - mB);
  return {
    possible: true,
    intersection: new Point(x, mA * (x - lineA.center.x) + lineA.center.y)
  };
};
var sq = (d) => d * d;
var intersectVerticalLineAndCircle = (line, circle, naturalPosition) => {
  const dx = Math.abs(circle.center.x - line.center.x);
  if (dx > circle.radius) {
    return {
      possible: false
    };
  } else {
    const dy = Math.sqrt(circle.radius * circle.radius - dx * dx);
    const y = circle.center.y < naturalPosition.y ? circle.center.y + dy : circle.center.y - dy;
    const intersection = new Point(line.center.x, y);
    return {
      possible: true,
      intersection
    };
  }
};
var intersectLineAndCircle = (line, circle, naturalPosition) => {
  if (isVertical(line)) {
    return intersectVerticalLineAndCircle(line, circle, naturalPosition);
  }
  const m = Math.tan(line.angle);
  const n = line.center.y - m * line.center.x;
  const a = 1 + sq(m);
  const b = -circle.center.x * 2 + m * (n - circle.center.y) * 2;
  const c = sq(circle.center.x) + sq(n - circle.center.y) - sq(circle.radius);
  const d = sq(b) - 4 * a * c;
  if (d >= 0) {
    const intersections = [
      (-b + Math.sqrt(d)) / (2 * a),
      (-b - Math.sqrt(d)) / (2 * a)
    ].map((x) => new Point(x, m * x + n));
    const errors = intersections.map((point) => point.vectorFrom(naturalPosition).distance());
    const intersection = errors[0] < errors[1] ? intersections[0] : intersections[1];
    return {
      possible: true,
      intersection
    };
  } else {
    return {
      possible: false
    };
  }
};
var intersectCircleAndCircle = (circleA, circleB, naturalPosition) => {
  const betweenCenters = circleA.center.vectorFrom(circleB.center);
  const d = betweenCenters.distance();
  if (d > Math.abs(circleA.radius - circleB.radius) && d < circleA.radius + circleB.radius) {
    const a = (circleB.radius * circleB.radius - circleA.radius * circleA.radius + d * d) / (2 * d);
    const midPoint = circleB.center.translate(betweenCenters.scale(a / d));
    const h = Math.sqrt(circleB.radius * circleB.radius - a * a);
    const bisector = betweenCenters.perpendicular().scale(h / d);
    const intersections = [midPoint.translate(bisector), midPoint.translate(bisector.invert())];
    const errors = intersections.map((point) => point.vectorFrom(naturalPosition).distance());
    const intersection = errors[0] < errors[1] ? intersections[0] : intersections[1];
    return {
      possible: true,
      intersection
    };
  } else {
    return {
      possible: false
    };
  }
};

// libs/model/src/lib/guides/intervals.ts
var coLinearIntervals = (natural, coLinear) => {
  if (coLinear.length < 2)
    return [];
  const intervals = [];
  const nearest = coLinear.sort((a, b) => Math.abs(natural - a) - Math.abs(natural - b))[0];
  const sorted = coLinear.sort((a, b) => a - b);
  const nearestIndex = sorted.indexOf(nearest);
  const polarity = Math.sign(nearest - natural);
  if (nearestIndex > 0 && polarity < 0 || nearestIndex < sorted.length - 1 && polarity > 0) {
    const secondNearest = sorted[nearestIndex + polarity];
    const interval = nearest - secondNearest;
    const candidate = nearest + interval;
    intervals.push({
      candidate,
      error: Math.abs(candidate - natural)
    });
  }
  if (nearestIndex > 0 && polarity > 0 || nearestIndex < sorted.length - 1 && polarity < 0) {
    const opposite = sorted[nearestIndex - polarity];
    const interval = nearest - opposite;
    const candidate = nearest - interval / 2;
    intervals.push({
      candidate,
      error: Math.abs(candidate - natural)
    });
  }
  return intervals;
};
var angularDifference = (a, b) => {
  const rawDifference = Math.abs(a - b);
  return Math.min(rawDifference, Math.PI * 2 - rawDifference);
};
var angularIntervals = (natural, equidistant) => {
  if (equidistant.length < 2)
    return [];
  const intervals = [];
  const nearest = equidistant.sort((a, b) => angularDifference(natural, a) - angularDifference(natural, b))[0];
  const sorted = equidistant.sort((a, b) => a - b);
  const nearestIndex = sorted.indexOf(nearest);
  const polarity = Math.sign(nearest - natural);
  const wrapIndex = (index) => {
    if (index < 0)
      return index + sorted.length;
    if (index > sorted.length - 1)
      return index - sorted.length;
    return index;
  };
  const secondNearest = sorted[wrapIndex(nearestIndex + polarity)];
  const extensionInterval = nearest - secondNearest;
  const extensionCandidate = nearest + extensionInterval;
  intervals.push({
    candidate: extensionCandidate,
    error: Math.abs(extensionCandidate - natural)
  });
  const opposite = sorted[wrapIndex(nearestIndex - polarity)];
  const bisectionInterval = nearest - opposite;
  const bisectionCandidate = nearest - bisectionInterval / 2;
  intervals.push({
    candidate: bisectionCandidate,
    error: Math.abs(bisectionCandidate - natural)
  });
  return intervals;
};

// libs/model/src/lib/guides/guides.ts
var byAscendingError = (a, b) => a.error - b.error;
var Guides = class {
  guidelines;
  naturalPosition;
  naturalRadius;
  constructor(guidelines = [], naturalPosition, naturalRadius) {
    this.guidelines = guidelines;
    this.naturalPosition = naturalPosition;
    this.naturalRadius = naturalRadius;
  }
};

// libs/model/src/lib/guides/LineGuide.ts
var LineGuide = class {
  center;
  angle;
  error;
  constructor(center, angle, naturalPosition) {
    this.center = center;
    this.angle = angle;
    this.error = this.calculateError(naturalPosition);
  }
  get type() {
    return "LINE";
  }
  calculateError(naturalPosition) {
    const yAxisPoint = naturalPosition.translate(this.center.vectorFromOrigin().invert()).rotate(-this.angle);
    return Math.abs(yAxisPoint.y);
  }
  snap(naturalPosition) {
    return this.point(this.scalar(naturalPosition));
  }
  scalar(position) {
    const xAxisPoint = position.translate(this.center.vectorFromOrigin().invert()).rotate(-this.angle);
    return xAxisPoint.x;
  }
  point(scalar) {
    return new Point(scalar, 0).rotate(this.angle).translate(this.center.vectorFromOrigin());
  }
  combine(otherGuide, naturalPosition) {
    switch (otherGuide.type) {
      case "LINE":
        return intersectLineAndLine(this, otherGuide);
      case "CIRCLE":
        return intersectLineAndCircle(this, otherGuide, naturalPosition);
      default:
        throw Error("unknown Guide type: " + otherGuide.type);
    }
  }
  intervalGuide(nodes, naturalPosition) {
    const otherNodesOnGuide = nodes.filter((node) => this.calculateError(node.position) < 0.01).map((node) => this.scalar(node.position));
    const intervals = coLinearIntervals(this.scalar(naturalPosition), otherNodesOnGuide);
    intervals.sort(byAscendingError);
    if (intervals.length > 0) {
      const interval = intervals[0];
      return new LineGuide(this.point(interval.candidate), this.angle + Math.PI / 2, naturalPosition);
    }
    return null;
  }
};

// libs/model/src/lib/guides/CircleGuide.ts
var CircleGuide = class {
  center;
  radius;
  error;
  constructor(center, radius, naturalPosition) {
    this.center = center;
    this.radius = radius;
    this.error = this.calculateError(naturalPosition);
  }
  get type() {
    return "CIRCLE";
  }
  calculateError(naturalPosition) {
    const offset = naturalPosition.vectorFrom(this.center);
    return Math.abs(offset.distance() - this.radius);
  }
  snap(naturalPosition) {
    const offset = naturalPosition.vectorFrom(this.center);
    return this.center.translate(offset.scale(this.radius / offset.distance()));
  }
  scalar(position) {
    const offset = position.vectorFrom(this.center);
    return offset.angle();
  }
  combine(otherGuide, naturalPosition) {
    switch (otherGuide.type) {
      case "LINE":
        return intersectLineAndCircle(otherGuide, this, naturalPosition);
      case "CIRCLE":
        return intersectCircleAndCircle(this, otherGuide, naturalPosition);
      default:
        throw Error("unknown Guide type: " + otherGuide.type);
    }
  }
  intervalGuide(nodes, naturalPosition) {
    const otherNodesOnGuide = nodes.filter((node) => this.calculateError(node.position) < 0.01).map((node) => this.scalar(node.position));
    const intervals = angularIntervals(this.scalar(naturalPosition), otherNodesOnGuide);
    intervals.sort(byAscendingError);
    if (intervals.length > 0) {
      const interval = intervals[0];
      return new LineGuide(this.center, interval.candidate, naturalPosition);
    }
    return null;
  }
};

// libs/model/src/lib/guides/HandleGuide.ts
var HandleGuide = class {
  handlePosition;
  constructor(handlePosition) {
    this.handlePosition = handlePosition;
  }
  get type() {
    return "HANDLE";
  }
};
export {
  CircleGuide,
  Guides,
  HandleGuide,
  LineGuide,
  Point,
  Vector,
  ViewTransformation,
  addLabel,
  angularIntervals,
  areParallel,
  asKey,
  attachmentOptions,
  average,
  black,
  blueGreen,
  byAscendingError,
  canvasPadding,
  categoriesPresent,
  coLinearIntervals,
  completeWithDefaults,
  computeCanvasSize,
  databaseTypeToStringType,
  defaultFontSize,
  defaultNodeRadius,
  defaultRelationshipLength,
  emptyGraph,
  footerHeight,
  getNodeIdMap,
  getStyleSelector,
  googleFonts,
  graphsDifferInMoreThanPositions,
  grey,
  headerHeight,
  idsMatch,
  imageAttributes,
  indexableText,
  inspectorWidth,
  intersectCircleAndCircle,
  intersectLineAndCircle,
  intersectLineAndLine,
  isNode,
  isRelationship,
  moveTo,
  neighbourPositions,
  nextAvailableId,
  nextId,
  nodeEditing,
  nodeSelected,
  nodeStyleAttributes,
  originPoint,
  otherNodeId,
  purple,
  red,
  redActive,
  relationshipEditing,
  relationshipHitTolerance,
  relationshipSelected,
  relationshipStyleAttributes,
  removeLabel,
  renameLabel,
  reverse,
  ringMargin,
  selectedNodeIdMap,
  selectedNodeIds,
  selectedNodes,
  selectedRelationshipIdMap,
  selectedRelationshipIds,
  selectedRelationships,
  selectionBorder,
  selectionHandle,
  setCaption,
  setType,
  stringTypeToDatabaseType,
  styleAttributeGroups,
  styleAttributes,
  styleTypes,
  subtractPadding,
  themes,
  translate,
  usedCodePoints,
  validate,
  white
};
