const robot = require("robotjs");

// Access the command-line arguments (after the script name and 'node')
const docPrefix = process.argv[2];
const companyId = process.argv[3];
const user = process.argv[4];
const docSuffix = process.argv[5] ? `-${process.argv[5]}` : '';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function navigateToElement(id) {
  return `document.getElementById('${id}').focus();`;
}

async function openConsoleAndFocusElement(id, closeConsole = true) {
  robot.keyTap("f12");
  await delay(1000);
  robot.keyTap('k', ['control', 'shift']);
  robot.typeString(navigateToElement(id));
  robot.keyTap('enter');
  if (closeConsole) {
    robot.keyTap("f12");
  }
  await delay(1500);
}

function pressButton(name) {
  return `document.querySelector('button[name="${name}"]').click()`;
}

function tabToPrintEnterButton() {
  // navigate to press save button
  robot.keyTap("tab");
  robot.keyTap("tab");
  robot.keyTap("tab");
  robot.keyTap("tab");
  robot.keyTap("enter");
}

async function openAndFocusOnBrowserSearchbar(searchString) {
  robot.setKeyboardDelay(10);
  await delay(1000);
  robot.keyTap("command");
  await delay(500);
  robot.typeString("firefox");
  await delay(500);
  robot.keyTap("enter");
  await delay(500);
  // Simulate pressing Ctrl+L to focus on the address bar
  robot.keyTap('l', ['control']);
  robot.typeString(searchString);
  robot.keyTap("enter");
}

async function closeFirefox() {
  await delay(5000);
  robot.keyTap('q', ['control', 'shift']);
}

async function getKaupparekisteriote() {
  await openAndFocusOnBrowserSearchbar("https://virre.prh.fi/");

  // navigate virre to input search field
  await openConsoleAndFocusElement('criteriaText');
  robot.typeString(companyId);
  robot.keyTap("enter");

  // press "Avaa maksuton kaupparekisteriote" -button
  robot.keyTap("f12");
  await delay(1000);
  robot.typeString(pressButton('_eventId_createElectronicTRExtract'));
  robot.keyTap('enter');

  // Print report that opened to new tab
  await delay(1000);
  await openConsoleAndFocusElement('print');
  robot.keyTap('enter');
  await delay(1000);

  tabToPrintEnterButton();

  // save pdf to local machine
  await delay(1000);
  robot.typeString(`${docPrefix}-kaupparekisteriote${docSuffix}`);
  await delay(1000);
  robot.keyTap("enter");

  await closeFirefox();
}

async function getRekisterit() {
  await openAndFocusOnBrowserSearchbar("ytj.fi");

  // navigate to input search field
  await openConsoleAndFocusElement('search-term');
  robot.typeString(companyId);
  robot.keyTap("enter");

  // press: "Tulosta yrityksen tiedot"
  robot.keyTap("f12");
  await delay(1000);
  robot.keyTap('k', ['control', 'shift']);
  robot.typeString("document.getElementsByClassName('text-button')[0].click()");
  robot.keyTap('enter');
  await delay(1000);

  tabToPrintEnterButton();

  // save pdf to local machine
  await delay(1000);
  robot.typeString(`${docPrefix}-rekisterit${docSuffix}`);
  await delay(1000);
  robot.keyTap("enter");

  await closeFirefox();
}

async function getYelVakuutusMaksuTodistus() {
  await openAndFocusOnBrowserSearchbar("ilmarinen.fi/asiointi");

  // press: "Siirry tunnistukseen"
  robot.keyTap("f12");
  await delay(1000);
  robot.keyTap('k', ['control', 'shift']);
  // for some reason element doesn't have any identifier than className: button and it's third button on the page..
  robot.typeString("document.getElementsByClassName('button')[2].click()");
  robot.keyTap('enter');
  await delay(1000);

  await openConsoleAndFocusElement('osuuspankki');
  robot.keyTap('enter');
  await delay(2000);
  await openConsoleAndFocusElement('auth-device-userid-mobilekey');
  robot.typeString(user);
  robot.keyTap('enter');

  // Here it waits 20sec user to finish 2fa auth process.
  console.log('Finish 2fa auth process with your auth device..');
  await delay(20000);
  console.log('Times up! moving on.');
  await openConsoleAndFocusElement('continue-button');
  robot.keyTap('enter');
  await delay(3000);

  // go to "selaa todistuksia" page
  robot.keyTap("f12");
  await delay(1000);
  robot.keyTap('k', ['control', 'shift']);
  // for some reason element doesn't have any identifier than className: button and it's first h2 element on the page..
  robot.typeString("document.getElementsByClassName('linkheader')[0].firstElementChild.click();");
  robot.keyTap('enter');
  robot.keyTap("f12");
  await delay(2000);


  await openConsoleAndFocusElement('avaa_yel_maksutodistus');
  robot.keyTap('enter');

  // Print report that opened to new tab
  await delay(1000);
  await openConsoleAndFocusElement('print');
  robot.keyTap('enter');
  await delay(1000);

  tabToPrintEnterButton();
  // save pdf to local machine
  await delay(1000);
  robot.typeString(`${docPrefix}-vakuutusmaksutodistus${docSuffix}`);
  await delay(1000);
  robot.keyTap("enter");

  await closeFirefox();
}

async function getAllLuotettavaKumppaniDocs() {
  if (!docPrefix || !companyId || !user) {
    console.log('missing required args from command: docPrefix || companyId || user. In that order');
    return;
  }
  await getYelVakuutusMaksuTodistus();
  await getKaupparekisteriote();
  await getRekisterit();
}

getAllLuotettavaKumppaniDocs();
