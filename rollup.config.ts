import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'lib/MemoryCache.esm.js',
                entryFileNames: '[name]',
                exports: 'named',
                format: 'es',
                sourcemap: true
            },
            {
                file: 'lib/MemoryCache.js',
                format: 'cjs',
                sourcemap: true
            }
        ],
        plugins: [
            typescript({ tsconfig: './tsconfig.json', sourceMap: true })
        ]
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'lib/MemoryCache.d.ts',
            format: 'es',
            sourcemap: false
        },
        plugins: [
            dts()
        ]
    }
];