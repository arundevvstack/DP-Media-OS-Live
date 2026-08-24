import { BaseService } from '@/core/services/BaseService';
import { UserRepository, userRepository } from '../repositories/UserRepository';

export class UserService extends BaseService {
  constructor(private readonly repository: UserRepository = userRepository) {
    super();
  }
  // Add domain logic here
}

export const userService = new UserService();
