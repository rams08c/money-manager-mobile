import {
    IsUUID,
    IsNumber,
    IsString,
    IsOptional,
    IsDateString,
    Min,
    Validate,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isDifferentAccount', async: false })
class IsDifferentAccountConstraint implements ValidatorConstraintInterface {
    validate(toAccountId: string, args: ValidationArguments) {
        const object = args.object as any;
        return toAccountId !== object.fromAccountId;
    }

    defaultMessage() {
        return 'Cannot transfer to the same account';
    }
}

export class CreateTransferDto {
    @IsUUID('4', { message: 'From account ID must be a valid UUID' })
    fromAccountId: string;

    @IsUUID('4', { message: 'To account ID must be a valid UUID' })
    @Validate(IsDifferentAccountConstraint)
    toAccountId: string;

    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'Amount must have at most 2 decimal places' },
    )
    @Min(0.01, { message: 'Amount must be greater than zero' })
    amount: number;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Transaction date must be a valid ISO date' })
    transactionDate?: string;
}
