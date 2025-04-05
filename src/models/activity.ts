import { getCookie } from '@utils/cookie';
import { GoodDate } from '@utils/datetime';
import { errorBadRequest, errorForbidden, errorInternal, errorNotFound } from '@utils/error-msg';

export enum ActivityState {
    Draft = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    TicketPending = 4,
    TicketApproved = 5,
    TicketRejected = 6,
}

export const getActivityStateString = (state: ActivityState): string => {
    switch (state) {
        case ActivityState.Draft:
            return '活动草稿';
        case ActivityState.Pending:
            return '活动待审核';
        case ActivityState.Approved:
            return '活动审核通过';
        case ActivityState.Rejected:
            return '活动审核不通过';
        case ActivityState.TicketPending:
            return '活动加分条待审核';
        case ActivityState.TicketApproved:
            return '活动加分条审核通过';
        case ActivityState.TicketRejected:
            return '活动加分条审核不通过';
        default:
            return '';
    }
};

export class Activity {
    id: string;
    name: string;
    description: string;
    location: string;
    date: GoodDate;
    state: ActivityState;
    owner: string;
    createdAt: GoodDate;
    updatedAt: GoodDate;
    deletedAt: GoodDate | undefined;

    constructor(
        id: string,
        name: string,
        description: string,
        location: string,
        date: string | GoodDate,
        state: ActivityState,
        owner: string,
        createdAt: string | GoodDate,
        updatedAt: string | GoodDate,
        deletedAt?: string | GoodDate
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.date = typeof date === 'string' ? GoodDate.fromString(date) : date;
        this.state = state;
        this.owner = owner;
        this.createdAt = typeof createdAt === 'string' ? GoodDate.fromString(createdAt) : createdAt;
        this.updatedAt = typeof updatedAt === 'string' ? GoodDate.fromString(updatedAt) : updatedAt;
        this.deletedAt = deletedAt
            ? typeof deletedAt === 'string'
                ? GoodDate.fromString(deletedAt)
                : deletedAt
            : undefined;
    }

    static fromJSON(json: any): Activity {
        return new Activity(
            json.id,
            json.name,
            json.description,
            json.location,
            json.date,
            json.state,
            json.owner,
            json.createdAt,
            json.updatedAt,
            json.deletedAt
        );
    }

    static fromJSONList(json: any): Activity[] {
        return json.map((item: any) => Activity.fromJSON(item));
    }

    static template = new Activity(
        '',
        '',
        '',
        '',
        new GoodDate(),
        ActivityState.Draft,
        '',
        new GoodDate(),
        new GoodDate(),
        undefined
    );

    static list = async (limit: number, offset: number, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/activity' + `?limit=${limit}&offset=${offset}`);
        const json = await response.json();
        if (response.ok) {
            return Activity.fromJSONList(json.data);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json['error']);
        }
    };

    static get = async (id: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + id);
        const json = await response.json();
        if (response.ok) {
            return Activity.fromJSON(json);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json['error']);
        }
    };

    static create = async (
        data: {
            name: string;
            description: string;
            location: string;
            date: string;
        },
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(props.serverEndpoint + '/activity/new', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
            body: JSON.stringify(data),
        });

        const json = await response.json();

        if (response.ok) {
            return Activity.fromJSON(json.data);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json.error);
        }
    };

    static update = async (
        id: string,
        data: {
            name: string;
            description: string;
            location: string;
            date: string;
        },
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(props.serverEndpoint + '/activity/update/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
            body: JSON.stringify(data),
        });
        const json = await response.json();

        if (response.ok) {
            return Activity.fromJSON(json.data);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json.error);
        }
    };

    static delete = async (id: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + id, {
            method: 'DELETE',
            headers: {
                Authorization: getCookie('token') || '',
            },
        });
        if (response.ok) {
            return true;
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            const json = await response.json();
            throw new Error(json.error);
        }
    };
}

export class ActivityDetail {
    id: string;
    activityId: string;
    name: string;
    maxPoints: number;

    constructor(id: string, activityId: string, name: string, maxPoints: number) {
        this.id = id;
        this.activityId = activityId;
        this.name = name;
        this.maxPoints = maxPoints;
    }

    static fromJSON(json: any): ActivityDetail {
        return new ActivityDetail(json.id, json.activityId, json.name, json.maxPoints);
    }

    static fromJSONList(json: any): ActivityDetail[] {
        return json.map((item: any) => ActivityDetail.fromJSON(item));
    }

    static template = new ActivityDetail('', '', '', 0);

    static list = async (activityId: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + activityId + '/detail');
        const json = await response.json();
        if (response.ok) {
            return ActivityDetail.fromJSONList(json.data);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json['error']);
        }
    };

    static create = async (
        activityId: string,
        data: {
            id: string;
            name: string;
            maxPoints: number;
        },
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + activityId + '/detail/new', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
            body: JSON.stringify(data),
        });

        const json = await response.json();

        if (response.ok) {
            return ActivityDetail.fromJSON(json.data);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json.error);
        }
    };

    static update = async (
        activityId: string,
        id: string,
        data: {
            name: string;
            maxPoints: number;
        },
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + activityId + '/detail/update/' + id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
            body: JSON.stringify(data),
        });
        const json = await response.json();

        if (response.ok) {
            return ActivityDetail.fromJSON(json.data);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json.error);
        }
    };

    static delete = async (activityId: string, id: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + activityId + '/detail/' + id, {
            method: 'DELETE',
            headers: {
                Authorization: getCookie('token') || '',
            },
        });
        if (response.ok) {
            return true;
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            const json = await response.json();
            throw new Error(json.error);
        }
    };
}
