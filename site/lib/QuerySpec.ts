import { NextRequest } from 'next/server';

function isObjectEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

export type QuerySpecType = {
  userIds: string[];
  markerIds: string[];
  tags: string[];
  allTags: boolean;
  near: {
    lat: number | null;
    lng: number | null;
    distance: number | null;
  };
  dateRange: {
    from: string | null;
    to: string | null;
    isDatetime: boolean;
  };
};

export class QuerySpec implements QuerySpecType {
  userIds: string[];
  markerIds: string[];
  tags: string[];
  allTags: boolean;
  near: { lat: number | null; lng: number | null; distance: number | null };
  dateRange: { from: string | null; to: string | null; isDatetime: boolean };

  constructor() {
    this.userIds = [];
    this.markerIds = [];
    this.tags = [];
    this.allTags = false;
    this.near = {
      lat: null,
      lng: null,
      distance: QuerySpec.DEFAULT_DISTANCE,
    };
    this.dateRange = {
      from: null,
      to: null,
      isDatetime: false,
    };
  }

  static get DEFAULT_DISTANCE() {
    return 40000;
  }

  toUrlParameters() {
    let urlParams = '';

    if (this.userIds && this.userIds.length > 0) {
      let uidParams = '';
      for (let i = 0; i < this.userIds.length; i++) {
        uidParams += `uid=${this.userIds[i]}`;
        if (i < this.userIds.length - 1) {
          uidParams += '&';
        }
      }

      urlParams += uidParams;
    }

    if (this.tags && this.tags.length > 0) {
      let tagParams = urlParams.length > 0 ? '&' : '';
      for (let i = 0; i < this.tags.length; i++) {
        tagParams += `tag=${this.tags[i]}`;
        if (i < this.tags.length - 1) {
          tagParams += '&';
        }
      }

      urlParams += tagParams;
    }

    if (this.markerIds && this.markerIds.length > 0) {
      let markerIdParams = urlParams.length > 0 ? '&' : '';
      for (let i = 0; i < this.markerIds.length; i++) {
        markerIdParams += `markerid=${this.markerIds[i]}`;
        if (i < this.markerIds.length - 1) {
          markerIdParams += '&';
        }
      }

      urlParams += markerIdParams;
    }

    if (this.tags && this.tags.length > 0 && this.allTags) {
      urlParams += urlParams.length > 0 ? '&alltags' : 'alltags';
    }

    if (this.near.lat && this.near.lng && this.near.distance) {
      let nearParams = urlParams.length > 0 ? '&' : '';
      nearParams += `nearlng=${this.near.lng}&nearlat=${this.near.lat}&distance=${this.near.distance}`;
      urlParams += nearParams;
    }

    let fromParams = urlParams.length > 0 ? '&' : '';
    if (this.dateRange.from && this.dateRange.from.length > 0) {
      fromParams += `from=${this.dateRange.from}`;
      urlParams += fromParams;
    }

    let toParams = urlParams.length > 0 ? '&' : '';
    if (this.dateRange.to && this.dateRange.to.length > 0) {
      toParams += `to=${this.dateRange.to}`;
      urlParams += toParams;
    }

    if (this.dateRange.isDatetime) {
      urlParams += urlParams.length > 0 ? '&isdatetime' : 'isdatetime';
    }

    return urlParams;
  }

  validate() {
    if (!this.userIds) {
      this.userIds = [];
    }

    if (!this.tags) {
      this.tags = [];
    }

    if (!this.markerIds) {
      this.markerIds = [];
    }

    if (this.allTags === null || this.allTags === undefined) {
      this.allTags = false;
    }

    if (this.near === null || this.near === undefined) {
      this.near = {
        lng: null,
        lat: null,
        distance: QuerySpec.DEFAULT_DISTANCE,
      };
    } else {
      const nearLngParam =
        this.near.lng !== null ? parseFloat(this.near.lng.toString()) : null;
      this.near.lng =
        Number.isNaN(nearLngParam) || nearLngParam === null
          ? null
          : nearLngParam;

      const nearLatParam =
        this.near.lat !== null ? parseFloat(this.near.lat.toString()) : null;
      this.near.lat = Number.isNaN(nearLatParam) ? null : nearLatParam;

      const distanceParam =
        this.near.distance !== null
          ? parseFloat(this.near.distance.toString())
          : null;
      this.near.distance = Number.isNaN(distanceParam)
        ? QuerySpec.DEFAULT_DISTANCE
        : distanceParam;
    }

    if (this.dateRange === null || this.dateRange === undefined) {
      this.dateRange = {
        from: null,
        to: null,
        isDatetime: false,
      };
    } else {
      const fromDateStringParam = this.dateRange.from;
      const fromDateValid = fromDateStringParam
        ? !Number.isNaN(Date.parse(fromDateStringParam))
        : false;
      this.dateRange.from = fromDateValid ? fromDateStringParam : null;

      const toDateStringParam = this.dateRange.to;
      const toDateValid = toDateStringParam
        ? !Number.isNaN(Date.parse(toDateStringParam))
        : false;
      this.dateRange.to = toDateValid ? toDateStringParam : null;

      if (
        this.dateRange.isDatetime === null ||
        this.dateRange.isDatetime === undefined
      ) {
        this.dateRange.isDatetime = false;
      }
    }
  }

  static createFromJSONString(s: string) {
    return QuerySpec.createFromJSON(JSON.parse(s));
  }

  static createFromJSON(json: object) {
    let qs = Object.assign(new QuerySpec(), json);
    qs.validate();

    return qs;
  }

  static createFromUrlSearchParams(params: URLSearchParams) {
    let qs = new QuerySpec();

    qs.userIds = params.getAll('uid');
    qs.tags = params.getAll('tag');
    qs.markerIds = params.getAll('markerid');
    qs.allTags =
      params.get('alltags') !== null && params.get('alltags') !== undefined;
    qs.near.lng = parseFloat(params.get('nearlng') ?? '');
    qs.near.lat = parseFloat(params.get('nearlat') ?? '');
    qs.near.distance = parseFloat(params.get('distance') ?? '');
    qs.dateRange.from = params.get('from') ?? '';
    qs.dateRange.to = params.get('to') ?? '';
    qs.dateRange.isDatetime =
      params.get('isdatetime') !== null &&
      params.get('isdatetime') !== undefined;

    qs.validate();

    return qs;
  }

  static createFromRequest(request: NextRequest) {
    let qs = new QuerySpec();
    const url = request.nextUrl;

    let tagObj: string | string[] | null = url.searchParams.get('tag');
    let tags: string[] = [];
    if (tagObj && !Array.isArray(tagObj)) {
      tags = [tagObj];
    }
    qs.tags = tags;

    const alltags = url.searchParams.get('alltags');
    qs.allTags = alltags !== null && alltags !== undefined;

    let userIdObjs: string | string[] | null = url.searchParams.get('uid');
    let userIds: string[] = [];
    if (userIdObjs && !Array.isArray(userIdObjs)) {
      userIds = [userIdObjs];
    }
    qs.userIds = userIds;

    let markerIdObjs: string | string[] | null =
      url.searchParams.get('markerid');
    let markerIds: string[] = [];
    if (markerIdObjs && !Array.isArray(markerIdObjs)) {
      markerIds = [markerIdObjs];
    }
    qs.markerIds = markerIds;

    const nearlng = url.searchParams.get('nearlng');
    const nearLngParam: number | null = nearlng ? parseFloat(nearlng) : null;
    qs.near.lng = nearLngParam;

    const nearlat = url.searchParams.get('nearlat');
    const nearLatParam: number | null = nearlat ? parseFloat(nearlat) : null;
    qs.near.lat = nearLatParam;

    const distance = url.searchParams.get('distance');
    const distanceParam: number | null = distance ? parseFloat(distance) : null;
    qs.near.distance = distanceParam;

    qs.dateRange.from = url.searchParams.get('from');
    qs.dateRange.to = url.searchParams.get('to');
    qs.dateRange.isDatetime = url.searchParams.has('isdatetime');

    qs.validate();

    return qs;
  }

  buildMongoDBQuery(defaultQuery: object): object {
    const params = this;
    const userIdQuery = buildUserIdQuery(params.userIds);
    const tagsQuery = buildTagsQuery(params.tags, params.allTags);
    const markerIdQuery = buildMarkerIdQuery(params.markerIds);
    const nearLocationQuery = buildNearLocationQuery(params.near);
    const dateRangeQuery = buildDateRangeQuery(params.dateRange);

    if (
      isObjectEmpty(userIdQuery) &&
      isObjectEmpty(tagsQuery) &&
      isObjectEmpty(markerIdQuery) &&
      isObjectEmpty(nearLocationQuery) &&
      isObjectEmpty(dateRangeQuery)
    ) {
      return defaultQuery;
    }

    let orQuery = [];
    if (!isObjectEmpty(markerIdQuery)) {
      orQuery.push(markerIdQuery);
    }

    let andQuery = [];
    if (!isObjectEmpty(userIdQuery)) {
      andQuery.push(userIdQuery);
    }
    if (!isObjectEmpty(tagsQuery)) {
      andQuery.push(tagsQuery);
    }
    if (!isObjectEmpty(nearLocationQuery)) {
      andQuery.push(nearLocationQuery);
    }
    if (!isObjectEmpty(dateRangeQuery)) {
      andQuery.push(dateRangeQuery);
    }

    if (andQuery.length > 0) {
      orQuery.push({ $and: andQuery });
    }

    if (orQuery.length === 0) {
      return defaultQuery;
    } else {
      return {
        $and: [
          { archived: false, deleted: false, draft: { $in: [false, null] } },
          { $or: orQuery },
        ],
      };
    }
  }
}

function buildMarkerIdQuery(markerIds: string[]): object {
  if (markerIds.length === 0) {
    return {};
  }

  return {
    id: { $in: markerIds },
  };
}

function buildUserIdQuery(userIds: string[]): object {
  if (userIds.length === 0) {
    return {};
  }

  return {
    userId: { $in: userIds },
  };
}

function buildTagsQuery(tags: string[], allTags: boolean): object {
  if (tags.length === 0) {
    return {};
  }

  if (allTags) {
    // All tags: AND intersection of specified tags
    const ary = tags.map(item => {
      return { tags: item };
    });
    return {
      $and: ary,
    };
  } else {
    // Any tags: OR intersection of specified tags
    return {
      tags: { $in: tags },
    };
  }
}

function buildNearLocationQuery(near: QuerySpecType['near']): object {
  const lat = near.lat;
  const lng = near.lng;
  const distance = near.distance;

  if (Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(distance)) {
    return {};
  }

  return {
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $minDistance: 0,
        $maxDistance: distance,
      },
    },
  };
}

function buildDateRangeQuery(dateRange: QuerySpec['dateRange']) {
  const fromDateString = dateRange.from;
  const toDateString = dateRange.to;
  const isDatetime = dateRange.isDatetime;

  if (!fromDateString && !toDateString) {
    return {};
  }

  const fromDateValid = fromDateString
    ? Date.parse(fromDateString) !== Number.NaN
    : false;
  const toDateValid = toDateString
    ? Date.parse(toDateString) !== Number.NaN
    : false;

  if (!fromDateValid && !toDateValid) {
    return {};
  }

  const fromDate: string | null = fromDateValid
    ? new Date(fromDateString as string).toString()
    : null;
  const toDate: string | null = toDateValid
    ? new Date(toDateString as string).toString()
    : null;

  if (fromDateValid && toDateValid) {
    if (fromDate !== null && toDate !== null && toDate <= fromDate) {
      return {};
    }
  }

  const dateField = isDatetime ? 'datetime' : 'posttime';

  let dateRangeJson: QuerySpecType['dateRange'] = {
    from: null,
    to: null,
    isDatetime: isDatetime,
  };

  if (fromDateValid) {
    dateRangeJson.from = fromDate;
  }
  if (toDateValid) {
    dateRangeJson.to = toDate;
  }

  return dateRangeJson;
}
