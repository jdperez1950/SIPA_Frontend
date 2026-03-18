import { Injectable } from '@angular/core';
import { IndicatorEntity, IndicatorDataItem } from '../models/indicators.models';
import { DashboardColumn, ListItem, BadgeItem } from '../../shared/components/dashboard-stats/dashboard-stats.component';

@Injectable({
  providedIn: 'root'
})
export class IndicatorsMapperService {

  mapToDashboardColumns(entities: IndicatorEntity[]): DashboardColumn[] {
    return entities.map(entity => this.mapEntityToColumns(entity)).flat();
  }

  private mapEntityToColumns(entity: IndicatorEntity): DashboardColumn[] {
    return entity.indicators.map(indicator => {
      switch (indicator.draw) {
        case 'vertical':
        case 'horizontal':
          return {
            kind: 'list',
            title: indicator.name,
            items: this.mapIndicatorDataToListItems(indicator.data)
          };
        case 'legend':
          return {
            kind: 'badge',
            title: indicator.name,
            badges: this.mapIndicatorDataToBadges(indicator.data)
          };
        default:
          return { kind: 'list', items: [] };
      }
    });
  }

  private mapIndicatorDataToListItems(data: IndicatorDataItem[]): ListItem[] {
    return data.map(item => ({
      label: item.indicator,
      count: item.value,
      percent: item.percentaje,
      color: this.mapColorToTailwind(item.color)
    }));
  }

  private mapIndicatorDataToBadges(data: IndicatorDataItem[]): BadgeItem[] {
    return data.map(item => ({
      value: item.value,
      percent: item.percentaje,
      color: this.mapColorToBadgeColor(item.color),
      badgeTitle: item.indicator
    }));
  }

  private mapColorToTailwind(backendColor: string): ListItem['color'] {
    const colorMap: Record<string, ListItem['color']> = {
      'Black': 'gray',
      'Green': 'green',
      'Blue': 'blue',
      'Red': 'red',
      'Yellow': 'orange',
      'Gray': 'gray',
      'Aquamarine': 'green'
    };
    return colorMap[backendColor] || 'gray';
  }

  private mapColorToBadgeColor(backendColor: string): BadgeItem['color'] {
    const colorMap: Record<string, BadgeItem['color']> = {
      'Black': 'gray',
      'Green': 'green',
      'Blue': 'blue',
      'Red': 'red',
      'Yellow': 'orange',
      'Gray': 'gray',
      'Aquamarine': 'green'
    };
    return colorMap[backendColor] || 'gray';
  }
}
