'use client';

import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import {
  useGetCommodities,
  useGetDistricts,
  useGetMarkets,
  useGetStates,
} from '@/api/generated/endpoints/meta/meta';
import { Label } from '@/components/ui/label';
import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/utils';
import { Combobox } from './combobox';
import { useCropLabel } from './crop-name';

/** Any form that has these optional string fields can use <LocationFields>. */
type LocationForm = FieldValues & {
  state?: string;
  district?: string;
  market?: string;
};

interface Props<T extends LocationForm> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  /** Which fields to show. Default: all three. */
  fields?: ('state' | 'district' | 'market')[];
  className?: string;
}

/**
 * State → District → Mandi. Each list only shows places that actually have data,
 * and picking a state clears the district and mandi below it.
 */
export function LocationFields<T extends LocationForm>({
  control,
  setValue,
  fields = ['state', 'district', 'market'],
  className,
}: Props<T>) {
  const { t } = useT();
  const state = useWatch({ control, name: 'state' as Path<T> }) as string | undefined;
  const district = useWatch({ control, name: 'district' as Path<T> }) as string | undefined;

  const states = useGetStates();
  const districts = useGetDistricts({ state }, { query: { enabled: fields.includes('district') } });
  const markets = useGetMarkets({ state, district }, { query: { enabled: fields.includes('market') } });

  const clear = (...names: ('district' | 'market')[]) => {
    for (const n of names) {
      // biome-ignore lint/suspicious/noExplicitAny: generic form value reset
      setValue(n as Path<T>, undefined as any, { shouldDirty: true });
    }
  };

  return (
    <div className={cn('grid gap-3 sm:grid-cols-3', className)}>
      {fields.includes('state') ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-state">{t('common.state')}</Label>
          <Controller
            control={control}
            name={'state' as Path<T>}
            render={({ field }) => (
              <Combobox
                id="f-state"
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  clear('district', 'market');
                }}
                options={states.data ?? []}
                loading={states.isLoading}
                placeholder={t('common.allStates')}
                allLabel={t('common.allStates')}
              />
            )}
          />
        </div>
      ) : null}

      {fields.includes('district') ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-district">{t('common.district')}</Label>
          <Controller
            control={control}
            name={'district' as Path<T>}
            render={({ field }) => (
              <Combobox
                id="f-district"
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  clear('market');
                }}
                options={districts.data ?? []}
                loading={districts.isLoading}
                placeholder={t('common.allDistricts')}
                allLabel={t('common.allDistricts')}
              />
            )}
          />
        </div>
      ) : null}

      {fields.includes('market') ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-market">{t('common.market')}</Label>
          <Controller
            control={control}
            name={'market' as Path<T>}
            render={({ field }) => (
              <Combobox
                id="f-market"
                value={field.value}
                onChange={field.onChange}
                options={markets.data ?? []}
                loading={markets.isLoading}
                placeholder={t('common.allMarkets')}
                allLabel={t('common.allMarkets')}
              />
            )}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Crop picker; the list narrows to crops sold in the chosen place. */
export function CropField<T extends FieldValues>({
  control,
  name,
  place,
  required,
  invalid,
}: {
  control: Control<T>;
  name: Path<T>;
  place?: { state?: string; district?: string; market?: string };
  required?: boolean;
  invalid?: boolean;
}) {
  const { t } = useT();
  const label = useCropLabel();
  const crops = useGetCommodities(place ?? {});

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="f-crop">{t('common.commodity')}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Combobox
            id="f-crop"
            value={field.value}
            onChange={field.onChange}
            options={crops.data ?? []}
            loading={crops.isLoading}
            placeholder={t('common.selectCrop')}
            allLabel={required ? undefined : t('common.selectCrop')}
            renderOption={label}
            invalid={invalid}
          />
        )}
      />
    </div>
  );
}
