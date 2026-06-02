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
      parentId = 0;
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
  async update() {}
  //delete category
  async destroy() {}
}
