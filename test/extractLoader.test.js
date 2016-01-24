import path from "path";
import fs from "fs";
import rimRaf from "rimraf";
import chai, { expect } from "chai";
import chaiFs from "chai-fs";
import compile from "./support/compile";

chai.use(chaiFs);

describe("extractLoader", () => {
    afterEach(() => {
        rimRaf.sync(path.resolve(__dirname, "dist"));
    });
    it("should extract 'hello' into simple.js", () => {
        return compile({ testModule: "simple.js" }).then(() => {
            const simpleJs = path.resolve(__dirname, "dist/simple-dist.js");

            expect(simpleJs).to.be.a.file();
            expect(simpleJs).to.have.content("hello");
        });
    });
    it("should extract the html of modules/simple.html into simple.html", () => {
        return compile({ testModule: "simple.html" }).then(() => {
            const simpleHtml = path.resolve(__dirname, "dist/simple-dist.html");

            expect(simpleHtml).to.be.a.file();
            expect(simpleHtml).to.have.content(
                fs.readFileSync(path.resolve(__dirname, "modules/simple.html"), "utf8")
            );
        });
    });
    it("should extract the css of modules/simple.css into simple.css", () => {
        return compile({ testModule: "simple.css" }).then(() => {
            const simpleCss = path.resolve(__dirname, "dist/simple-dist.css");

            expect(simpleCss).to.be.a.file();
            expect(simpleCss).to.have.content(
                fs.readFileSync(path.resolve(__dirname, "modules/simple.css"), "utf8")
            );
        });
    });
    it("should extract the img url into img.js", () => {
        return compile({ testModule: "img.js" }).then(() => {
            const imgJs = path.resolve(__dirname, "dist/img-dist.js");

            expect(imgJs).to.be.a.file();
            expect(imgJs).to.have.content("hi-dist.jpg");
        });
    });
    it("should extract the img.html as file, emit the referenced img and rewrite the url", () => {
        return compile({ testModule: "img.html" }).then(() => {
            const imgHtml = path.resolve(__dirname, "dist/img-dist.html");
            const imgJpg = path.resolve(__dirname, "dist/hi-dist.jpg");

            expect(imgHtml).to.be.a.file();
            expect(imgJpg).to.be.a.file();
            expect(imgHtml).to.have.content.that.match(/<img src="hi-dist\.jpg">/);
        });
    });
    it("should extract the img.css as file, emit the referenced img and rewrite the url", () => {
        return compile({ testModule: "img.css" }).then(() => {
            const imgCss = path.resolve(__dirname, "dist/img-dist.css");
            const imgJpg = path.resolve(__dirname, "dist/hi-dist.jpg");

            expect(imgCss).to.be.a.file();
            expect(imgJpg).to.be.a.file();
            expect(imgCss).to.have.content.that.match(/ url\(hi-dist\.jpg\);/);
        });
    });
    it("should extract the stylesheet.html and the referenced img.css as file, emit the files and rewrite all urls", () => {
        return compile({ testModule: "stylesheet.html" }).then(() => {
            const stylesheetHtml = path.resolve(__dirname, "dist/stylesheet-dist.html");
            const imgCss = path.resolve(__dirname, "dist/img-dist.css");
            const imgJpg = path.resolve(__dirname, "dist/hi-dist.jpg");

            expect(stylesheetHtml).to.be.a.file();
            expect(imgCss).to.be.a.file();
            expect(imgJpg).to.be.a.file();
            expect(stylesheetHtml).to.have.content.that.match(/<link href="img-dist\.css"/);
            expect(stylesheetHtml).to.have.content.that.match(/<img src="hi-dist\.jpg">/);
            expect(imgCss).to.have.content.that.match(/ url\(hi-dist\.jpg\);/);
        });
    });
    it("should track all dependencies", () => {
        return compile({ testModule: "stylesheet.html" }).then((stats) => {
            const basePath = path.dirname(__dirname); // returns the parent dirname
            const dependencies = stats.compilation.fileDependencies.map(
                (dependency) => dependency.slice(basePath.length)
            );

            expect(dependencies.sort()).to.eql([
                "/node_modules/css-loader/lib/css-base.js",
                "/test/modules/hi.jpg",
                "/test/modules/img.css",
                "/test/modules/stylesheet.html"
            ].sort());
        });
    });
    it("should extract reference the img with the given publicPath", () => {
        return compile({ testModule: "img.html", publicPath: "/test/" }).then(() => {
            const imgHtml = path.resolve(__dirname, "dist/img-dist.html");
            const imgJpg = path.resolve(__dirname, "dist/hi-dist.jpg");

            expect(imgHtml).to.be.a.file();
            expect(imgJpg).to.be.a.file();
            expect(imgHtml).to.have.content.that.match(/<img src="\/test\/hi-dist\.jpg">/);
        });
    });
});
