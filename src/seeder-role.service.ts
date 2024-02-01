import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./modules/user/entities/role.entity";
import { Repository } from "typeorm";
import { Roles } from "./common/enums/roles.enum";

@Injectable()
export class SeederService {
    constructor(
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    ) { }

    async seed() {
        // Check if the Role table is empty
        const hasData = await this.roleRepository.count();

        // Only seed if there is no data
        if (hasData === 0) {
            await Promise.all(Object.values(Roles).map(async (roleName) => {
                const role = this.roleRepository.create({ name: roleName });
                await this.roleRepository.save(role);
            }));

            console.log('Seeding complete.');
        } else {
            console.log('Data already exists, skipping seeding.');
        }
    }
}
