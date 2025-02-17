import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { I18nService } from 'nestjs-i18n';
import { ClsService } from 'nestjs-cls';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(
    private cls: ClsService,
    private prisma: PrismaService,
    private i18n: I18nService,
  ) {}

  async list() {
    let lang = this.cls.get('lang');

    let list = await this.prisma.content.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });
    return list.map((item) => ({
      ...item,
      title: item.title?.[lang] || item.title?.['en'],
      slug: item.slug?.[lang] || item.slug?.['en'],
    }));
  }

  async itemBySlug(slug: string) {
    let lang = this.cls.get('lang');
    let languages = this.i18n.getSupportedLanguages();

    let slugCondition = languages.map((language) => {
      return {
        slug: {
          path: [language],
          equals: slug,
        },
      };
    });

    let item = await this.prisma.content.findFirst({
      where: {
        OR: slugCondition,
      },
    });

    if (!item)
      throw new NotFoundException('Content with this slug is not found');

    return {
      ...item,
      title: item.title?.[lang] || item.title?.['en'],
      content: item.content?.[lang] || item.content?.['en'],
      slug: item.slug?.[lang] || item.slug?.['en'],
    };
  }

  async create(params: CreateContentDto) {
    let languages = this.i18n.getSupportedLanguages();

    let slugCondition = languages
      .filter((lang) => params.slug[lang])
      .map((language) => {
        return {
          slug: {
            path: [language],
            equals: params.slug[language],
          },
        };
      });

    let checkSlug = await this.prisma.content.findFirst({
      where: {
        OR: slugCondition,
      },
    });
    if (checkSlug)
      throw new ConflictException('Given slug is used in anthoer content');
    return this.prisma.content.create({
      data: params,
    });
  }

  async update(id: number, params: UpdateContentDto) {
    let content = await this.prisma.content.findUnique({ where: { id } });
    if (!content) throw new NotFoundException('Content is not found');

    let languages = this.i18n.getSupportedLanguages();

    if (params.slug) {
      let slugCondition = languages
        .filter((lang) => params.slug![lang])
        .map((language) => {
          return {
            slug: {
              path: [language],
              equals: params.slug![language],
            },
          };
        });

      let checkSlug = await this.prisma.content.findFirst({
        where: {
          OR: slugCondition,
        },
      });

      if (checkSlug && checkSlug.id != content.id) {
        throw new ConflictException('Given slug is used in anthoer content');
      }

      await this.prisma.content.update({
        where: { id: content.id },
        data: params,
      });

      return {
        message: 'Content is updated succesfully',
      };
    }
  }

  delete(id: number) {
    return this.prisma.content.delete({ where: { id } });
  }
}
