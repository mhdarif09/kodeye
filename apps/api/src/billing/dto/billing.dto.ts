import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CurrencyQueryDto {
  @IsOptional() @IsIn(['IDR', 'USD', 'EUR', 'SGD']) currency = 'IDR';
}
export class ExchangeRateQueryDto {
  @IsIn(['IDR', 'USD', 'EUR', 'SGD']) base!: string;
  @IsIn(['IDR', 'USD', 'EUR', 'SGD']) quote!: string;
}
export class OrganizationQueryDto {
  @IsString() organizationId!: string;
}
export class CheckoutDto {
  @IsString() organizationId!: string;
  @IsString() planCode!: string;
  @IsIn(['IDR', 'USD', 'EUR', 'SGD']) currencyCode!: string;
  @IsOptional() @IsString() couponCode?: string;
}
export class CapturePayPalDto {
  @IsString() orderId!: string;
}
export class VerifySubscriptionDto {
  @IsString() subscriptionId!: string;
  @IsString() organizationId!: string;
}
export class EnterpriseRequestDto {
  @IsString() organizationId!: string;
  @IsString() companyName!: string;
  @IsEmail() contactEmail!: string;
  @IsOptional()
  @IsIn(['IDR', 'USD', 'EUR', 'SGD'])
  preferredCurrencyCode?: string;
  @IsOptional() @IsString() message?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestedRepositories?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestedScansPerMonth?: number;
}
export class PlanPriceDto {
  @IsIn(['IDR', 'USD', 'EUR', 'SGD']) currencyCode!: string;
  @Type(() => Number) @IsInt() @Min(0) amount!: number;
}
export class UpdatePlanDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) basePriceIdr?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) maxRepositories?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) maxScansPerMonth?: number;
  @IsOptional() @IsBoolean() enablePdfReport?: boolean;
  @IsOptional() @IsBoolean() enableGithubAutoScan?: boolean;
  @IsOptional() @IsBoolean() enableRecurring?: boolean;
  @IsOptional() @IsBoolean() requiresManualApproval?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class CouponDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsIn(['PERCENT', 'FIXED_AMOUNT']) type!: 'PERCENT' | 'FIXED_AMOUNT';
  @IsOptional() @Type(() => Number) @Min(0) percentOff?: number;
  @IsOptional() @IsString() appliesToPlanCode?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
