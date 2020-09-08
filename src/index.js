const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const replace = require('@rollup/plugin-replace');
const postcss = require('rollup-plugin-postcss');
const image = require('@rollup/plugin-image');
const json = require('rollup-plugin-json');
const react = require('react');
const reactDom = require('react-dom');
const reactIs = require('react-is');
const propTypes = require('prop-types');
const nodeGlobals = require('rollup-plugin-node-globals');
const builtins = require('rollup-plugin-node-builtins');
const url = require('postcss-url');
const buildUmd = require('./utils/build.js);

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'prop-types': 'PropTypes',
  'monaco-editor': 'monacoEditor',
  echarts: 'echarts',
  fengmap: 'fengmap',
  '@antv/l7': 'L7',
};

const external = Object.keys(globals);

const plugins = [
  resolve({
    mainFields: ['module', 'main', 'browser'],
    browser: true,
    customResolveOptions: {
      moduleDirectory: 'node_modules', // 仅处理node_modules内的库
    },
  }),
  commonjs({
    include: /node_modules/,
    namedExports: {
      react: Object.keys(react),
      'react-dom': Object.keys(reactDom),
      'react-is': Object.keys(reactIs),
      'node_modules/react-is/index.js': ['isFragment'],
      'node_modules/react/index.js': [
        'Fragment',
        'cloneElement',
        'isValidElement',
        'Children',
        'createContext',
        'Component',
        'useRef',
        'useImperativeHandle',
        'forwardRef',
        'useState',
        'useEffect',
        'useMemo',
      ],
      'node_modules/react-dom/index.js': ['render', 'unmountComponentAtNode', 'findDOMNode'],
      'prop-types': Object.keys(propTypes),
      'node_modules/react-responsive-carousel/lib/es/index.js': ['Carousel'],
      'node_modules/ansi-colors/index.js': ['styles'],
      'node_modules/eventemitter3/index.js': ['EventEmitter'],
      'node_modules/umi-plugin-react/locale/index.js': ['getLocale'],
      'node_modules/raf/index.js': ['default'],
      'node_modules/@antv/l7-map/node_modules/eventemitter3/index.js': ['EventEmitter'],
    },
    esmExternals: true,
    requireReturnsDefault: true,
  }),
  json(),
  image(),
  postcss({
    modules: true, // 增加 css-module 功能
    extensions: ['.less', '.css'],
    use: [
      [
        'less',
        {
          javascriptEnabled: true,
        },
      ],
    ],
  }),
  babel({
    exclude: /node_modules/,
    runtimeHelpers: true,
  }),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  nodeGlobals(),
  builtins(),
  // uglify()
];

var options = process.argv;
console.log('optionsoptions', options);
let inputAndOutputList = [];
if (options[2]) {
  const buildName = 'AMap';
  const inputPath = `${buildName}`;
  inputAndOutputList = [
    {
      input: `./src/libs/${inputPath}/config`,
      output: {
        name: `${buildName}Config`,
        file: `dist/${buildName}/config.js`,
      },
      modalKey: buildName,
    },
    {
      input: `./src/libs/${inputPath}/lib`,
      output: {
        name: `${buildName}Lib`,
        file: `dist/${buildName}/lib.js`,
      },
      modalKey: buildName,
    },
    {
      input: `./src/libs/${inputPath}/data.js`,
      output: {
        name: `${buildName}Data`,
        file: `dist/${buildName}/data.js`,
      },
      modalKey: buildName,
    },
  ];
}

async function build() {
  // create a bundle
  for (const opts of inputAndOutputList) {
    const inputOptions = {
      input: opts.input, // 唯一必填参数
      external,
      plugins,
    };
    const bundle = await rollup.rollup(inputOptions);
    const {
      output: { name, file },
    } = opts;
    const outputOptions = {
      globals,
      format: 'umd',
      intro: 'l7 = window.L7',
      name,
      file,
    };
    await bundle.generate(outputOptions);
    await bundle.write(outputOptions);
  }
}

build();
