const express = require("express");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();

app.use(express.json());

app.post("/mahagapp/modify-html", async (req, res) => {
  const html = req.body.html;

  // Launch a new browser instance
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  // Set the HTML content of the page
  await page.setContent(html);

  // Remove all script tags
  await page.evaluate(() => {
    const scripts = Array.from(document.getElementsByTagName("script"));
    scripts.forEach((script) => script.parentNode.removeChild(script));
  });

  // Get the modified HTML
  const modifiedHtml = await page.content();

  // Close the browser
  await browser.close();

  // Return the modified HTML
  res.send(modifiedHtml);
});

function runScriptsAndReturnHTML() {
  // Read the HTML file
  const html = fs.readFileSync("./index.html", "utf-8");

  // Create a new JSDOM instance
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
  });

  // Get the window object
  const { window } = dom;

  // Run all scripts inside the HTML file
  const scripts = window.document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    eval(scripts[i].textContent);
  }

  // Return the modified HTML
  return dom.serialize();
}
runScriptsAndReturnHTML();

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
