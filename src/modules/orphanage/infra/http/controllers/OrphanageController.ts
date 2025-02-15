import CreateOrphanageService from '@modules/orphanage/services/CreateOrphanageService';
import ListOrphanageService from '@modules/orphanage/services/ListOrphanageService';
import FindOrphanageService from '@modules/orphanage/services/FindOrphanageService';
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';
import * as Yup from 'yup';
import axios from 'axios';

export default class OrphanageController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { orphanageId } = request.params;
    const findOrphanageService = container.resolve(FindOrphanageService);

    const orphanage = await findOrphanageService.execute(orphanageId);

    return response.json(classToClass(orphanage));
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const listOrphanageService = container.resolve(ListOrphanageService);

    const orphanages = await listOrphanageService.execute();

    return response.status(201).json(classToClass(orphanages));
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const {
      name,
      about,
      instructions,
      latitude,
      longitude,
      open_hours,
      open_on_weekends,
    } = request.body;

    const data = {
      name,
      about,
      instructions,
      latitude,
      longitude,
      open_hours,
      open_on_weekends: open_on_weekends === 'true',
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      about: Yup.string().required().max(300),
      instructions: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      open_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required(),
        }),
      ),
    });

    await schema.validate(data, {
      abortEarly: false,
    });

    const requestImages = request.files as Express.Multer.File[];
    const images = requestImages.map(file => ({
      path: file.filename,
    }));

    const createUser = container.resolve(CreateOrphanageService);

    const orphanage = await createUser.execute({ ...data, images });

    const loggedSocket = request.connectedUsers['bg-notification'];

    request.io.to(loggedSocket).emit('orphanage', JSON.stringify(data));

    const sendNotification = async (): Promise<void> => {
      try {
        await axios.post('https://exp.host/--/api/v2/push/send', {
          to: 'ExponentPushToken[YH7bVLLdBVBCttzIejyqdv]',
          sound: 'default',
          title: 'Novo orfanato',
          body: 'Confira o novo orfanato cadastrado',
          data: {
            data: 'goeshere',
          },
        });
      } catch (error) {
        console.error(error);
      }
    };

    sendNotification();

    return response.status(201).json(orphanage);
  }
}
