import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>) {}

  create(createProjectDto: CreateProjectDto, ownerId: string) {
    return this.projectModel.create({ ...createProjectDto, ownerId });
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

    return this.projectModel.findByIdAndUpdate(id, updateProjectDto, { new: true });
  }

  async remove(id: string, ownerId: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    if (project.ownerId !== ownerId) {
      throw new ForbiddenException(`You are not authorized to delete this project`);
    }
    this.projectModel.findByIdAndDelete(id);
    return 'Project deleted';
  }
}
