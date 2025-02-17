import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ContentService } from './content.service';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { CreateContentDto } from './dto/create-content.dto';
import { UserRole } from '@prisma/client';
import { UpdateContentDto } from './dto/update-content.dto';

@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get()
  list() {
    return this.contentService.list();
  }

  @Get(':slug')
  itemBySlug(@Param('slug') slug: string) {
    return this.contentService.itemBySlug(slug);
  }

  @Post()
  @Auth(UserRole.ADMIN)
  create(@Body() body: CreateContentDto) {
    return this.contentService.create(body);
  }

  @Post(':id')
  @Auth(UserRole.ADMIN)
  update(@Param('id') id: number, @Body() body: UpdateContentDto) {
    return this.contentService.update(id, body);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  delete(@Param('id') id: number) {
    return this.contentService.delete(id);
  }
}
