import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createPatientDto: CreatePatientDto) {
    const { ...patientData } = createPatientDto;

    const patient = this.patientRepository.create({
      ...patientData,
    });

    return this.patientRepository.save(patient);
  }

  findAll() {
    return this.patientRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string) {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!patient) {
      throw new NotFoundException(`Patient #${id} not found`);
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }

    // If updating user link
    if (updatePatientDto.user) {
      const user = await this.userRepository.findOne({
        where: { id: updatePatientDto.user.id },
      });
      if (!user) {
        throw new NotFoundException(
          `User with id ${updatePatientDto.user} not found`,
        );
      }
      patient.user = user;
    }

    Object.assign(patient, updatePatientDto);

    return this.patientRepository.save(patient);
  }

  remove(id: number) {
    return `This action removes a #${id} patient`;
  }
}
