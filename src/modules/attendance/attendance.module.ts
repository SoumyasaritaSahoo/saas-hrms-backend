import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AttendanceShift } from '../../database/models/attendance-shift.model';
import { User } from '../../database/models/user.model';
import { AttendanceShiftController } from './attendance-shift.controller';
import { AttendanceShiftService } from './attendance-shift.service';

// NOTE: trimmed from the source project. The source's attendance.module.ts
// also wired AttendanceLogController/Service, AttendanceRegularization
// Controller/Service and their models (AttendanceLog, AttendanceRule,
// AttendanceRegularization) — none of that check-in/out/regularization
// business logic is part of Employee management. Only AttendanceShift
// (the shift an employee is assigned via `shift_id`) is in scope here,
// per the porting brief.
@Module({
  imports: [SequelizeModule.forFeature([AttendanceShift, User])],
  controllers: [AttendanceShiftController],
  providers: [AttendanceShiftService],
  exports: [AttendanceShiftService],
})
export class AttendanceModule {}
