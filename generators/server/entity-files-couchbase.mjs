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
import { SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';

export const entityCouchbaseFiles = {
  dbChangelog: [
    {
      condition: generator => !generator.skipDbChangelog && !generator.embedded,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/couchmove/changelog/entity.n1ql',
          renameTo: generator => `config/couchmove/changelog/V${generator.changelogDate}__${generator.entityInstance.toLowerCase()}.n1ql`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngineCouchbase && !generator.skipDbChangelog && !generator.embedded,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/couchmove/changelog/entity.fts',
          renameTo: generator =>
            `config/couchmove/changelog/V${parseInt(generator.changelogDate, 10) + 10}__${generator.entityInstance.toLowerCase()}.fts`,
        },
      ],
    },
  ],
  server: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/Entity.java.jhi.spring_data_couchbase',
          renameTo: generator => `${generator.entityAbsoluteFolder}/domain/${generator.persistClass}.java.jhi.spring_data_couchbase`,
        },
      ],
    },
    {
      condition: generator => !generator.embedded,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/EntityRepository.java',
          renameTo: generator => `${generator.entityAbsoluteFolder}/repository/${generator.entityClass}Repository.java`,
        },
      ],
    },
  ],
};

export function writeEntityCouchbaseFiles() {
  return {
    cleanupCouchbaseEntityFiles({ application, entities }) {
      if (!application.databaseTypeCouchbase) return;
      for (const entity of entities.filter(entity => !entity.builtIn && !entity.skipServer)) {
        if (this.isJhipsterVersionLessThan('7.6.1')) {
          this.removeFile(
            `${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V${entity.changelogDate}__${entity.entityInstance.toLowerCase()}.fts`
          );
        }
      }
    },

    async writeEntityCouchbaseFiles({ application, entities }) {
      if (!application.databaseTypeCouchbase) return;

      for (const entity of entities.filter(entity => !entity.builtIn && !entity.skipServer)) {
        await this.writeFiles({
          sections: entityCouchbaseFiles,
          rootTemplatesPath: 'entity/couchbase',
          context: { ...application, ...entity },
        });
      }
    },
  };
}
