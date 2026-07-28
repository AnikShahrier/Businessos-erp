import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { IsString, IsOptional, IsEnum, IsNumber, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
}

class CreateEmployeeDto {
  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsString()
  @MinLength(1)
  department: string;

  @IsString()
  @MinLength(1)
  position: string;

  @IsString()
  @IsOptional()
  joinDate?: string;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  salary?: number;

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

@UseGuards(JwtAuthGuard)  // <-- ADD THIS
@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.employeesService.findAll(req.user.organizationId);  // <-- FIX: req.user
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.findOne(id, req.user.organizationId);  // <-- FIX: req.user
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    console.log('Received DTO:', dto);
    return this.employeesService.create(dto, req.user.organizationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @Req() req: any) {
    return this.employeesService.update(id, dto, req.user.organizationId);  // <-- FIX: req.user
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.employeesService.remove(id, req.user.organizationId);  // <-- FIX: req.user
  }
}