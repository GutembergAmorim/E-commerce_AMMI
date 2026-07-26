/**
 * Wrapper para eliminar try-catch repetitivo nos controllers.
 * Erros não tratados caem automaticamente no errorHandler middleware.
 *
 * Uso:
 *   const getProducts = asyncHandler(async (req, res) => {
 *     const products = await Product.find();
 *     res.json({ success: true, data: products });
 *   });
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
