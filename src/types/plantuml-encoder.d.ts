declare module 'plantuml-encoder' {
  function encode(uml: string): string;
  function decode(encoded: string): string;
  export = { encode, decode };
}
