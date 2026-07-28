import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateInventoryDto, @Request() req) {
    return this.inventoryService.create(dto, req.user.organizationId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.inventoryService.findAll(req.user.organizationId, {
      search,
      category,
      lowStock: lowStock === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.inventoryService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
    @Request() req,
  ) {
    return this.inventoryService.update(id, dto, req.user.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.inventoryService.remove(id, req.user.organizationId);
  }
}