import { inject, injectable } from 'tsyringe';
import IOrphanageRepository from '../repositories/IOrphanageRepository';
import Orphanage from '../infra/typeorm/entities/Orphanage';
import ICreateOrphanageDTO from '../dtos/ICreateOrphanageDTO';

interface Request {
  name: string;
  email: string;
  password: string;
}

@injectable()
class CreateOrphanageService {
  constructor(
    @inject('OrphanageRepository')
    private orphanageRepository: IOrphanageRepository,
  ) {}

  public async execute({
    name,
    about,
    instructions,
    latitude,
    longitude,
    open_hours,
    open_on_weekends,
    images,
  }: ICreateOrphanageDTO): Promise<Orphanage> {
    const orphanage = this.orphanageRepository.create({
      name,
      about,
      instructions,
      latitude,
      longitude,
      open_hours,
      open_on_weekends,
      images,
    });

    return orphanage;
  }
}

export default CreateOrphanageService;
