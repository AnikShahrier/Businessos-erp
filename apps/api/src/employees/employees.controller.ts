import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { IsString, IsOptional, IsEnum } from 'class-validator';

enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

class CreateEmployeeDto {
  @IsString()
  @IsOptional()
  employeeId?: string;  // Made optional - backend will auto-generate

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  joinDate?: string;

  @IsString()
  @IsOptional()
  salary?: string;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  salary?: string;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.employeesService.findAll(req.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.findOne(id, req.organizationId);
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    return this.employeesService.create(dto, req.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @Req() req: any) {
    return this.employeesService.update(id, dto, req.organizationId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.remove(id, req.organizationId);
  }
}