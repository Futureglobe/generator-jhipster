/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
import _ from 'lodash';
import chalk from 'chalk';

import BaseGenerator from '../base/index.mjs';

import generatorDefaults from '../generator-defaults.cjs';
import prompts from './prompts.mjs';
import statistics from '../statistics.cjs';
import constants from '../generator-constants.cjs';
import { GENERATOR_CI_CD } from '../generator-list.mjs';
import { buildToolTypes } from '../../jdl/jhipster/index.mjs';

const { defaultConfig } = generatorDefaults;
const { MAVEN, GRADLE } = buildToolTypes;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;

export default class CiCdGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    // Automatically configure Travis
    this.option('autoconfigure-travis', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure Travis',
    });

    // Automatically configure Jenkins
    this.option('autoconfigure-jenkins', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure Jenkins',
    });

    // Automatically configure Gitlab
    this.option('autoconfigure-gitlab', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure Gitlab',
    });

    // Automatically configure Azure
    this.option('autoconfigure-azure', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure Azure',
    });

    // Automatically configure GitHub Actions
    this.option('autoconfigure-github', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure GitHub Actions',
    });

    // Automatically configure CircleCI
    this.option('autoconfigure-circle', {
      type: Boolean,
      defaults: false,
      description: 'Automatically configure CircleCI',
    });
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_CI_CD);
    }
  }

  // Public API method used by the getter and also by Blueprints
  get initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      sayHello() {
        this.log(chalk.white('🚀 Welcome to the JHipster CI/CD Sub-Generator 🚀'));
      },

      getSharedConfig() {
        this.loadAppConfig();
        this.loadClientConfig();
        this.loadServerConfig();
        this.loadPlatformConfig();
      },

      getConfig() {
        const configuration = this.config;
        this.dasherizedBaseName = _.kebabCase(this.baseName);
        this.herokuAppName = configuration.get('herokuAppName');
        if (this.herokuAppName === undefined) {
          this.herokuAppName = _.kebabCase(this.baseName);
        }
        this.autoconfigureTravis = this.options.autoconfigureTravis;
        this.autoconfigureJenkins = this.options.autoconfigureJenkins;
        this.autoconfigureGitlab = this.options.autoconfigureGitlab;
        this.autoconfigureAzure = this.options.autoconfigureAzure;
        this.autoconfigureGithub = this.options.autoconfigureGithub;
        this.autoconfigureCircleCI = this.options.autoconfigureCircle;
        this.abort = false;
      },

      initConstants() {
        this.NODE_VERSION = constants.NODE_VERSION;
        this.NPM_VERSION = constants.NPM_VERSION;
      },

      getConstants() {
        this.DOCKER_DIR = constants.DOCKER_DIR;
        this.SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
        this.DOCKER_JENKINS = constants.DOCKER_JENKINS;
        this.ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
        this.JAVA_VERSION = constants.JAVA_VERSION;
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get prompting() {
    return {
      askPipeline: prompts.askPipeline,
      askIntegrations: prompts.askIntegrations,
    };
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  // Public API method used by the getter and also by Blueprints
  get configuring() {
    return {
      insight() {
        if (this.abort) return;
        statistics.sendSubGenEvent('generator', GENERATOR_CI_CD);
      },
      setTemplateConstants() {
        if (this.abort) return;
        if (this.cicdIntegrations === undefined) {
          this.cicdIntegrations = [];
        }
        this.gitLabIndent = this.sendBuildToGitlab ? '    ' : '';
        this.indent = this.insideDocker ? '    ' : '';
        this.indent += this.gitLabIndent;
        if (this.clientFramework === REACT) {
          this.frontTestCommand = 'test-ci';
        } else {
          this.frontTestCommand = 'test';
        }
      },
    };
  }

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  _loadCiCdConfig(config = _.defaults({}, this.jhipsterConfig, defaultConfig), dest = this) {
    dest.cicdIntegrations = dest.cicdIntegrations || config.cicdIntegrations || [];
    dest.cicdIntegrationsSnyk = dest.cicdIntegrations.includes('snyk');
    dest.cicdIntegrationsSonar = dest.cicdIntegrations.includes('sonar');
    dest.cicdIntegrationsHeroku = dest.cicdIntegrations.includes('heroku');
    dest.cicdIntegrationsDeploy = dest.cicdIntegrations.includes('deploy');
    dest.cicdIntegrationsPublishDocker = dest.cicdIntegrations.includes('publishDocker');
    dest.cicdIntegrationsCypressDashboard = dest.cicdIntegrations.includes('cypressDashboard');
  }

  // Public API method used by the getter and also by Blueprints
  get loading() {
    return {
      loadSharedConfig() {
        this.loadAppConfig();
        this.loadDerivedAppConfig();
        this.loadClientConfig();
        this.loadDerivedClientConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
        this._loadCiCdConfig();
        this.loadPlatformConfig();
      },
    };
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return {
      writeFiles() {
        if (this.pipeline === 'jenkins') {
          this.template('jenkins/Jenkinsfile.ejs', 'Jenkinsfile');
          this.template('jenkins/jenkins.yml.ejs', `${this.DOCKER_DIR}jenkins.yml`);
          this.template('jenkins/idea.gdsl', `${this.SERVER_MAIN_RES_DIR}idea.gdsl`);
        }
        if (this.pipeline === 'gitlab') {
          this.template('.gitlab-ci.yml.ejs', '.gitlab-ci.yml');
        }
        if (this.pipeline === 'circle') {
          this.template('circle.yml.ejs', '.circleci/config.yml');
        }
        if (this.pipeline === 'travis') {
          this.template('travis.yml.ejs', '.travis.yml');
        }
        if (this.pipeline === 'azure') {
          this.template('azure-pipelines.yml.ejs', 'azure-pipelines.yml');
        }
        if (this.pipeline === 'github') {
          this.template('github-actions.yml.ejs', '.github/workflows/main.yml');
        }

        if (this.cicdIntegrations.includes('deploy')) {
          if (this.buildTool === MAVEN) {
            this.addMavenDistributionManagement(
              this.artifactorySnapshotsId,
              this.artifactorySnapshotsUrl,
              this.artifactoryReleasesId,
              this.artifactoryReleasesUrl
            );
          } else if (this.buildTool === GRADLE) {
            // TODO: add support here
            // this.addGradleDistributionManagement(this.artifactoryId, this.artifactoryName);
            this.warning('No support for Artifactory yet, when using Gradle.\n');
          }
        }

        if (this.cicdIntegrations.includes('publishDocker')) {
          this.template('docker-registry.yml.ejs', `${this.DOCKER_DIR}docker-registry.yml`);
        }
      },
    };
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}
