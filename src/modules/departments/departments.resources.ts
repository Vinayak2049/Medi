import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { DepartmentsService } from './departments.service.js';

export class DepartmentsResources {
  constructor(private departmentsService: DepartmentsService) {}

  @Resource({
    uri: 'departments://catalog',
    name: 'Department Catalog',
    description: 'All hospital departments with descriptions and the symptoms each one commonly handles',
    mimeType: 'application/json',
    examples: {
      response: { departments: [{ department: 'Cardiology', description: 'Heart and cardiovascular conditions' }] }
    }
  })
  async getCatalog(uri: string) {
    const departments = await this.departmentsService.listCatalog();
    return { type: 'json' as const, data: { departments } };
  }
}