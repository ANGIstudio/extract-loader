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
        return compile("simple.js").then(() => {
            const simpleJs = path.resolve(__dirname, "dist/simple-dist.js");

            expect(simpleJs).to.be.a.file();
            expect(simpleJs).to.have.content("hello");
        });
    });
    it("should extract the html of modules/simple.html into simple.html", () => {
        return compile("simple.html").then(() => {
            const simpleHtml = path.resolve(__dirname, "dist/simple-dist.html");

            expect(simpleHtml).to.be.a.file();
            expect(simpleHtml).to.have.content(
                fs.readFileSync(path.resolve(__dirname, "modules/simple.html"), "utf8")
            );
        });
    });
    it("should extract the css of modules/simple.css into simple.css", () => {
        return compile("simple.css").then(() => {
            const simpleCss = path.resolve(__dirname, "dist/simple-dist.css");

            expect(simpleCss).to.be.a.file();
            expect(simpleCss).to.have.content(
                fs.readFileSync(path.resolve(__dirname, "modules/simple.css"), "utf8")
            );
        });
    });
    it("should extract the img url into img.js", () => {
        return compile("img.js").then(() => {
            const imgJs = path.resolve(__dirname, "dist/img-dist.js");

            expect(imgJs).to.be.a.file();
            expect(imgJs).to.have.content("hi-dist.jpg");
        });
    });
    it("should extract the img.html as file, emit the referenced img and rewrite the url", () => {
        return compile("img.html").then(() => {
            const imgHtml = path.resolve(__dirname, "dist/img-dist.html");
            const imgJpg = path.resolve(__dirname, "dist/hi-dist.jpg");

            expect(imgHtml).to.be.a.file();
            expect(imgJpg).to.be.a.file();
            expect(imgHtml).to.have.content.that.match(/<img src="hi-dist\.jpg">/);
        });
    });
    it("should extract the img.css as file, emit the referenced img and rewrite the url", () => {
        return compile("img.css").then(() => {
            const imgCss = path.resolve(__dirname, "dist/img-dist.css");
            const imgJpg = path.resolve(__dirname, "dist/hi-dist.jpg");

            expect(imgCss).to.be.a.file();
            expect(imgJpg).to.be.a.file();
            expect(imgCss).to.have.content.that.match(/ url\(hi-dist\.jpg\);/);
        });
    });
    it("should extract the stylesheet.html and the referenced img.css as file, emit the files and rewrite all urls", () => {
        return compile("stylesheet.html").then(() => {
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
});
