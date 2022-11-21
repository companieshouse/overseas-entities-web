import { Express } from 'express';
import path from 'path';
import { configure, render } from 'nunjucks';
import * as config from '../config';
import { countryFilter } from '../utils/country.filter';
import { createChangeLinkConfig } from '../utils/change.link';

// set up the template engine
const configureViews = (
  app: Express,
) => {
  app.engine('html', render);
  app.set('view engine', 'html');

  const env = configure(
    [
      path.join(__dirname, '../../views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components',
    ],
    {
      autoescape: true,
      express: app,
    },
  );

  env.addGlobal('CDN_HOST', config.CDN_HOST);
  env.addGlobal('SERVICE_NAME', config.SERVICE_NAME);
  env.addGlobal('OE_CONFIGS', config);
  env.addGlobal('COUNTRY_FILTER', countryFilter);
  env.addGlobal('CREATE_CHANGE_LINK', createChangeLinkConfig);
  env.addGlobal("PIKA_URL", config.PIWIK_URL);
  env.addGlobal("PIKA_SITE_ID", config.PIWIK_SITE_ID);
  env.addGlobal("PIKA_START_GOAL_ID", config.PIWIK_START_GOAL_ID);
  env.addGlobal('MATOMO_ASSET_PATH', `//${config.CDN_HOST}`);
};

export default configureViews;
