export default interface ICreateOrphanageDTO {
  name: string;
  latitude: number;
  longitude: number;
  about: string;
  instructions: string;
  open_on_weekends: boolean;
  open_hours: string;
  images: any[];
}
