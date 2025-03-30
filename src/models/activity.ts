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
    TicketRejected = 6
}

export class Activity {
    id: string;
    name: string;
    description: string;
    location: string;
    date: GoodDate;
    state: ActivityState;
    owner: string;
    createdAt: GoodDate;
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
            json.deletedAt
        );
    }

    static fromJSONList(json: any): Activity[] {
        return json.map((item: any) => Activity.fromJSON(item));
    }

    static template = new Activity('', '', '', '', new GoodDate(), ActivityState.Draft, '', new GoodDate(), undefined);

    static list = async (limit: number, offset: number, props: { serverEndpoint?: string }) => {
        const response = await fetch(
            props.serverEndpoint + '/activity' + `?limit=${limit}&offset=${offset}`
        );
        const json = await response.json();
        if (response.ok) {
            return Activity.fromJSONList(json);
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