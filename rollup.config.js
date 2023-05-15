export default {
  input: 'src/RandomInt64.js',
  preserveEntrySignatures: 'strict',
  output: [
    {
      file: 'dist/random-int64.mjs',
      format: 'esm'
    },
    {
      file: 'dist/random-int64.cjs',
      format: 'cjs'
    }
  ]
};
