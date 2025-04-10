import { errorBadRequest, errorForbidden, errorInternal, errorNotFound } from '@utils/error-msg';
import { getCookie } from '@utils/cookie';

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
