import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryCreateRequest } from 'src/categories/dtos/request/category-create.request.dto';
import { Category } from 'src/categories/entities/category.entity';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { pathFileName } from 'src/commons/utils/path-file-name.util';
import { IJwtPayload } from 'src/auth/interfaces/jwt.interface';
import { User } from 'src/users/entities/user.entity';
import { CategoryReadReponse } from 'src/categories/dtos/response/categories-read.response';
import { plainToInstance } from 'class-transformer';
import { CategoryUpdateReq } from 'src/categories/dtos/request/category-update.request.dto';
import { RoleCode } from 'src/auth/enums/role-code.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly cateRepository: Repository<Category>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  //create category
  async create(
    body: CategoryCreateRequest,
    file: Express.Multer.File | null,
    path: string,
    user: IJwtPayload,
  ) {
    const { name, description, isActive } = body;
    let { parentId } = body;
    const slug = slugify(name, {
      lower: true,
      strict: true,
    });
    if (!parentId) {
      parentId = 1;
    }
    //check admin exist
    const admin = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (!admin) throw new InternalServerErrorException('admin not exist!');
    const cateCheck = await this.cateRepository.findOne({
      where: [{ name }, { slug }],
    });
    if (cateCheck)
      throw new ConflictException('name of slug category already exists');
    let pathCate: string | null = null;
    if (file) {
      pathCate = pathFileName(file, path);
    }
    const cateEntity = this.cateRepository.create({
      name,
      slug,
      description,
      image: pathCate != null ? pathCate : undefined,
      parentId,
      isActive,
      createdBy: admin.id,
      createdAt: Date(),
    });
    await this.cateRepository.save(cateEntity);
    console.log('categories log: ', cateEntity);
  }
  //read category
  async read() {
    const cateLog = await this.cateRepository.find({});
    const payload: CategoryReadReponse[] = cateLog.map((item) => ({
      name: item.name,
      slug: item.slug,
      description: item.description ?? undefined,
      image: item.image ?? undefined,
      isActive: item.isActive,
      parentId: item.parentId,
      createdAt: item.createdAt ?? undefined,
    }));
    return plainToInstance(CategoryReadReponse, { payload });
  }
  //update category
  async update(
    body: CategoryUpdateReq,
    user: IJwtPayload,
    file: Express.Multer.File | null,
    path: string,
  ) {
    const { id, name, description, parentId, isActive } = body;
    const { sub, email } = user;
    let pathCate: string | null = null;
    if (file) {
      pathCate = pathFileName(file, path);
    }
    const valisRole = [RoleCode.ADMIN, RoleCode.SUPERADMIN];
    let slug = '';
    if (name) {
      slug = slugify(name, {
        lower: true,
        strict: true,
      });
    }
    //check admin
    const admin = await this.userRepository.findOne({
      where: { email, id: sub },
      relations: {
        userRoles: { role: true },
      },
    });
    if (!admin) throw new InternalServerErrorException('user not exist!');
    const roleCheck = admin.userRoles.some((ur) =>
      valisRole.includes(ur.role.code as RoleCode),
    );
    if (!roleCheck) throw new InternalServerErrorException('role not exist!');
    //check exist
    const cate = await this.cateRepository.findOne({
      where: { id },
    });
    if (!cate) throw new InternalServerErrorException('category not exist!');
    if ()
      
    const cateUpdate = await this.cateRepository.update(cate.id, {
      name: name ?? cate.name,
      slug: name ? slug : cate.slug,
      description: description ?? cate.description,
      image: pathCate ?? cate.image,
      parentId: parentId ?? cate.parentId,
      isActive: isActive ?? cate.isActive,
      updatedBy: admin.id,
      updatedAt: Date(),
    });
    return cateUpdate;
  }
  //delete category
  async destroy() {}
}
