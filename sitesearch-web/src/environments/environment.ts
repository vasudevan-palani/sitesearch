// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  API_ENDPOINT : "https://devapi.sitesearch.svolve.com",
  stripeKey : 'pk_test_e8JHtmbINNjiITAEcUyb77Fp',
  firebase : {
    apiKey: "AIzaSyALwIRzd8-0tACUGay3xa0gaT6dXoED8yQ",
    authDomain: "opensearch-2a0db.firebaseapp.com",
    databaseURL: "https://opensearch-2a0db.firebaseio.com",
    projectId: "opensearch-2a0db",
    storageBucket: "opensearch-2a0db.appspot.com",
    messagingSenderId: "710024249927"
  }
};
