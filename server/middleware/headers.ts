export default defineEventHandler((event) => {
    setHeader(event, 'Cross-Origin-Embedder-Policy', 'require-corp');

})