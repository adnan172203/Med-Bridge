import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}
  async create(createPatientDto: CreatePatientDto) {
    const { ...patientData } = createPatientDto;

    // const user = await this.userRepository.findOne({ where: { id: userId } });
    // if (!user) {
    //   throw new NotFoundException(`User with id ${userId} not found`);
    // }

    const patient = this.patientRepository.create({
      ...patientData,
    });

    return this.patientRepository.save(patient);
  }

  findAll() {
    return `This action returns all patients`;
  }

  findOne(id: number) {
    return `This action returns a #${id} patient`;
  }

  update(id: number, updatePatientDto: UpdatePatientDto) {
    return `This action updates a #${id} patient`;
  }

  remove(id: number) {
    return `This action removes a #${id} patient`;
  }
}
