import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './entities/project.entity';
import { randomUUID } from 'crypto';
import { BrokerService } from '../broker/broker.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    private readonly brokerService: BrokerService,
  ) {}

  async create(createProjectDto: CreateProjectDto, ownerId: string) {
    const project = await this.projectModel.create({ ...createProjectDto, ownerId });

    try {
      await this.brokerService.publish('project.created', {
        event: 'ProjectCreated',
        version: '1.0',
        timestamp: new Date().toISOString(),
        correlationId: randomUUID(),
        _id: String(project._id),
        name: project.name,
        ownerId: project.ownerId,
        tags: project.tags ?? [],
        totalImages: project.totalImages ?? 0,
        processedImages: project.processedImages ?? 0,
        status: project.status ?? 'active',
        isPublic: project.isPublic ?? false,
      });
    } catch (err) {
      this.logger.error(
        `Failed to publish project.created event: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return project;
  }

  findAll(ownerId: string) {
    return this.projectModel.find({ ownerId });
  }

  async findOne(id: string, ownerId: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    if (project.ownerId !== ownerId) {
      throw new ForbiddenException(`You are not authorized to access this project`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, ownerId: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    if (project.ownerId !== ownerId) {
      throw new ForbiddenException(`You are not authorized to update this project`);
    }

    const updated = await this.projectModel.findByIdAndUpdate(id, updateProjectDto, {
      returnDocument: 'after',
    });

    if (updated) {
      try {
        await this.brokerService.publish('project.updated', {
          event: 'ProjectUpdated',
          version: '1.0',
          timestamp: new Date().toISOString(),
          correlationId: randomUUID(),
          _id: String(updated._id),
          name: updated.name,
          ownerId: updated.ownerId,
          tags: updated.tags ?? [],
          totalImages: updated.totalImages ?? 0,
          processedImages: updated.processedImages ?? 0,
          status: updated.status ?? 'active',
          isPublic: updated.isPublic ?? false,
        });
      } catch (err) {
        this.logger.error(
          `Failed to publish project.updated event: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return updated;
  }

  async remove(id: string, ownerId: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    if (project.ownerId !== ownerId) {
      throw new ForbiddenException(`You are not authorized to delete this project`);
    }
    await this.projectModel.findByIdAndDelete(id);

    try {
      await this.brokerService.publish('project.deleted', {
        event: 'ProjectDeleted',
        version: '1.0',
        timestamp: new Date().toISOString(),
        correlationId: randomUUID(),
        _id: id,
        ownerId: project.ownerId,
      });
    } catch (err) {
      this.logger.error(
        `Failed to publish project.deleted event: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    return { message: 'Project deleted' };
  }
}
