declare module 'pptxgenjs' {
  class PptxGenJS {
    constructor();
    addSlide(): any;
    ShapeType: {
      rectangle: string;
    };
    writeFile(options: { fileName: string }): void;
  }
  export = PptxGenJS;
} 