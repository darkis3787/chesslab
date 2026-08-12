declare module "pgn-parser" {
  const pgnParser: {
    parse(input: string): unknown[];
  };
  export default pgnParser;
}
