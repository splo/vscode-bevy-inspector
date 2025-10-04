export const getDecimalPlaces = (step: number) => {
  const parts = step.toString().split('.');
  return parts.length > 1 ? parts[1].length : 0;
};

export const createChangeEvent = (
  e: React.ChangeEvent<HTMLInputElement>,
  value: string,
): React.ChangeEvent<HTMLInputElement> => {
  return Object.assign({}, e, {
    target: {
      ...e.currentTarget,
      value,
      name: e.target.name,
    },
  });
};
