declare module "*.less" {
  const styles: Record<string, string>;
  export default styles;
}
declare module "*.css" {
  const styles: Record<string, string>;
  export default styles;
}

declare module "less-plugin-clean-css";
