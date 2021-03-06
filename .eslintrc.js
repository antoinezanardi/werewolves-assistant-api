module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
    },
    extends: ["eslint:recommended"],
    rules: {
        /*
         * ---- ESLint Rules -----
         * Possible Errors
         */
        "for-direction": "error",
        "getter-return": "error",
        "no-async-promise-executor": "error",
        "no-await-in-loop": "off",
        "no-compare-neg-zero": "error",
        "no-cond-assign": "error",
        "no-console": process.env.nodeEnv === "production" ? "error" : "warn",
        "no-constant-condition": "error",
        "no-control-regex": "error",
        "no-debugger": process.env.nodeEnv === "production" ? "error" : "warn",
        "no-dupe-args": "error",
        "no-dupe-else-if": "error",
        "no-dupe-keys": "error",
        "no-duplicate-case": "error",
        "no-empty": "error",
        "no-empty-character-class": "error",
        "no-ex-assign": "error",
        "no-extra-boolean-cast": "error",
        "no-extra-parens": "error",
        "no-extra-semi": "error",
        "no-func-assign": "error",
        "no-import-assign": "error",
        "no-inner-declarations": "error",
        "no-invalid-regexp": "error",
        "no-irregular-whitespace": "error",
        "no-loss-of-precision": "error",
        "no-misleading-character-class": "error",
        "no-obj-calls": "error",
        "no-promise-executor-return": "error",
        "no-prototype-builtins": "error",
        "no-regex-spaces": "error",
        "no-setter-return": "error",
        "no-sparse-arrays": "error",
        "no-template-curly-in-string": "error",
        "no-unexpected-multiline": "error",
        "no-unreachable": "warn",
        "no-unreachable-loop": "error",
        "no-unsafe-finally": "error",
        "no-unsafe-negation": "error",
        "no-unsafe-optional-chaining": "error",
        "no-useless-backreference": "error",
        "require-atomic-updates": "off",
        "use-isnan": "error",
        "valid-typeof": "error",
        /*
         * ---- ESLint Rules -----
         * Best Practises
         */
        "accessor-pairs": "error",
        "array-callback-return": "error",
        "block-scoped-var": "error",
        "class-methods-use-this": "error",
        "complexity": "error",
        "consistent-return": "off",
        "curly": "error",
        "default-case": "error",
        "default-case-last": "error",
        "default-param-last": "error",
        "dot-location": ["error", "property"],
        "dot-notation": "error",
        "eqeqeq": "error",
        "grouped-accessor-pairs": "error",
        "guard-for-in": "error",
        "max-classes-per-file": "error",
        "no-alert": "warn",
        "no-caller": "error",
        "no-case-declarations": "error",
        "no-constructor-return": "error",
        "no-div-regex": "error",
        "no-else-return": "error",
        "no-empty-function": "error",
        "no-empty-pattern": "error",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-fallthrough": "error",
        "no-floating-decimal": "error",
        "no-global-assign": "error",
        "no-implicit-coercion": ["error", { allow: ["!!"] }],
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-invalid-this": "off",
        "no-iterator": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-loop-func": "error",
        "no-magic-numbers": "off",
        "no-multi-spaces": "error",
        "no-multi-str": "off",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-wrappers": "error",
        "no-octal": "error",
        "no-octal-escape": "error",
        "no-param-reassign": "off",
        "no-proto": "error",
        "no-redeclare": "error",
        "no-restricted-properties": "off",
        "no-return-assign": "error",
        "no-return-await": "error",
        "no-script-url": "error",
        "no-self-assign": "error",
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-throw-literal": "error",
        "no-unmodified-loop-condition": "error",
        "no-unused-expressions": "error",
        "no-unused-labels": "error",
        "no-useless-call": "error",
        "no-useless-catch": "error",
        "no-useless-concat": "error",
        "no-useless-escape": "error",
        "no-useless-return": "error",
        "no-void": "error",
        "no-warning-comments": "off",
        "no-with": "error",
        "prefer-named-capture-group": "error",
        "prefer-promise-reject-errors": "error",
        "prefer-regex-literals": "error",
        "radix": ["error", "as-needed"],
        "require-await": "error",
        "require-unicode-regexp": "error",
        "vars-on-top": "error",
        "wrap-iife": "error",
        "yoda": "error",
        /*
         * ---- ESLint Rules -----
         * Strict Mode
         */
        "strict": "off",
        /*
         * ---- ESLint Rules -----
         * Variables
         */
        "init-declarations": "off",
        "no-delete-var": "error",
        "no-label-var": "error",
        "no-restricted-globals": "off",
        "no-shadow": ["error", { hoist: "never" }],
        "no-shadow-restricted-names": "error",
        "no-undef": "error",
        "no-undef-init": "error",
        "no-undefined": "off",
        "no-unused-vars": "error",
        "no-use-before-define": "error",
        /*
         * ---- ESLint Rules -----
         * Stylistic Issues
         */
        "array-bracket-newline": ["error", { multiline: true }],
        "array-bracket-spacing": ["error", "never"],
        "array-element-newline": ["error", "consistent"],
        "block-spacing": "error",
        "brace-style": "error",
        "camelcase": "error",
        "capitalized-comments": "off",
        "comma-dangle": ["error", "always-multiline"],
        "comma-spacing": ["error", { before: false, after: true }],
        "comma-style": "error",
        "computed-property-spacing": "error",
        "consistent-this": "error",
        "eol-last": ["error", "never"],
        "func-call-spacing": ["error", "never"],
        "func-name-matching": "off",
        "func-names": "error",
        "func-style": ["error", "declaration"],
        "function-call-argument-newline": ["error", "consistent"],
        "function-paren-newline": ["error", "never"],
        "id-denylist": "off",
        "id-length": "off",
        "id-match": "off",
        "implicit-arrow-linebreak": "error",
        "indent": "error",
        "jsx-quotes": ["error", "prefer-double"],
        "key-spacing": ["error", { mode: "strict" }],
        "keyword-spacing": "error",
        "line-comment-position": "error",
        "linebreak-style": "error",
        "lines-around-comment": "off",
        "lines-between-class-members": "error",
        "max-depth": "off",
        "max-len": ["error", { code: 150, ignoreTemplateLiterals: true, ignoreComments: true }],
        "max-lines": "off",
        "max-lines-per-function": ["error", { max: 30, skipComments: true }],
        "max-nested-callbacks": ["error", 2],
        "max-params": ["error", 6],
        "max-statements": "off",
        "max-statements-per-line": ["error", { max: 1 }],
        "multiline-comment-style": "error",
        "multiline-ternary": ["error", "never"],
        "new-cap": "error",
        "new-parens": "error",
        "newline-per-chained-call": "off",
        "no-array-constructor": "error",
        "no-bitwise": "error",
        "no-continue": "error",
        "no-inline-comments": "error",
        "no-lonely-if": "error",
        "no-mixed-operators": "off",
        "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
        "no-multi-assign": "error",
        "no-multiple-empty-lines": ["error", { max: 1 }],
        "no-negated-condition": "off",
        "no-nested-ternary": "error",
        "no-new-object": "error",
        "no-plusplus": "off",
        "no-restricted-syntax": ["error", "SwitchStatement", "SwitchCase", "DoWhileStatement"],
        "no-tabs": "off",
        "no-ternary": "off",
        "no-trailing-spaces": ["error", { skipBlankLines: true }],
        "no-underscore-dangle": "off",
        "no-unneeded-ternary": "error",
        "no-whitespace-before-property": "error",
        "nonblock-statement-body-position": ["error", "below"],
        "object-curly-newline": ["error", { multiline: true }],
        "object-curly-spacing": ["error", "always"],
        "object-property-newline": "off",
        "one-var": ["error", "never"],
        "one-var-declaration-per-line": ["error", "initializations"],
        "operator-assignment": ["error", "always"],
        "operator-linebreak": ["error", "after"],
        "padded-blocks": ["error", "never"],
        "padding-line-between-statements": [
            "error", {
                blankLine: "always",
                prev: "import",
                next: "*",
            }, {
                blankLine: "never",
                prev: "import",
                next: "import",
            }, {
                blankLine: "always",
                prev: "*",
                next: "export",
            },
        ],
        "prefer-exponentiation-operator": "error",
        "prefer-object-spread": "error",
        "quote-props": ["error", "consistent-as-needed"],
        "quotes": ["error", "double", { allowTemplateLiterals: true }],
        "semi": ["error", "always"],
        "semi-spacing": "error",
        "semi-style": ["error", "last"],
        "sort-keys": "off",
        "sort-vars": "off",
        "space-before-blocks": ["error", { functions: "always", keywords: "always", classes: "always" }],
        "space-before-function-paren": ["error", "never"],
        "space-in-parens": ["error", "never"],
        "space-infix-ops": "error",
        "space-unary-ops": [
            "error", {
                words: true,
                nonwords: false,
            },
        ],
        "spaced-comment": ["error", "always"],
        "switch-colon-spacing": "error",
        "template-tag-spacing": "error",
        "unicode-bom": "error",
        "wrap-regex": "error",
        /*
         * ---- ESLint Rules -----
         * ECMAScript 6
         */
        "arrow-body-style": ["error", "as-needed"],
        "arrow-parens": ["error", "as-needed"],
        "arrow-spacing": "error",
        "constructor-super": "error",
        "generator-star-spacing": [
            "error", {
                before: false,
                after: true,
            },
        ],
        "no-class-assign": "error",
        "no-confusing-arrow": "off",
        "no-const-assign": "error",
        "no-dupe-class-members": "error",
        "no-duplicate-imports": "error",
        "no-new-symbol": "error",
        "no-restricted-exports": "off",
        "no-restricted-imports": "off",
        "no-this-before-super": "error",
        "no-useless-computed-key": "error",
        "no-useless-constructor": "error",
        "no-useless-rename": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "prefer-arrow-callback": "error",
        "prefer-const": "error",
        "prefer-destructuring": "off",
        "prefer-numeric-literals": "error",
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "prefer-template": "error",
        "require-yield": "error",
        "rest-spread-spacing": "error",
        "sort-imports": "off",
        "symbol-description": "error",
        "template-curly-spacing": "error",
        "yield-star-spacing": "error",
    },
    parserOptions: {
        parser: "babel-eslint",
        sourceType: "module",
        ecmaVersion: 2020,
    },
    overrides: [
        {
            files: ["*.test.js", "*.spec.js"],
            rules: {
                "one-var": "off",
                "max-lines-per-function": "off",
                "max-nested-callbacks": "off",
                "no-unused-expressions": "off",
                "max-len": "off",
            },
        }, {
            files: ["src/routes/*.js"],
            rules: { "max-lines-per-function": "off" },
        }, {
            files: ["app.js"],
            rules: { "no-console": "off" },
        },
    ],
};