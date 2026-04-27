import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Project, ProjectDocument } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>) {}

  create(createProjectDto: CreateProjectDto) {
    return this.projectModel.create(createProjectDto);
  }

  findAll() {
    return this.projectModel.find();
  }

  async findOne(id: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  findByUser(userId: string) {
    return this.projectModel.find({ ownerId: userId });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return this.projectModel.findByIdAndUpdate(id, updateProjectDto, { new: true });
  }

  async remove(id: string) {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return this.projectModel.findByIdAndDelete(id);
  }
}
