//
// preprocess - Allows you to modify the markdown before it is
// handed to the MDX engine. Allows us to pipe in
// raidocs-templatize for modification of the MDX file
// prior to the main pipeline.
//
export default function preprocess(preprocessor) {
  const originalParser = this.Parser;
  this.Parser = (text) => {
    if (preprocessor) {
      return originalParser(preprocessor(text))
    }
    return originalParser(text);
  }
}
