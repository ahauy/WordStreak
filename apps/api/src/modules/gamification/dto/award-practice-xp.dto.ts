import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsLessThanOrEqualProperty(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isLessThanOrEqualProperty',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];
          return (
            typeof value === 'number' &&
            typeof relatedValue === 'number' &&
            value <= relatedValue
          );
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints as [string];
          return `${args.property} must not exceed ${relatedPropertyName}`;
        },
      },
    });
  };
}

export class AwardPracticeXpDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsInt()
  @Min(0)
  @IsLessThanOrEqualProperty('totalQuestions', {
    message: 'score must not exceed totalQuestions',
  })
  score: number;

  @IsInt()
  @Min(1)
  totalQuestions: number;
}
