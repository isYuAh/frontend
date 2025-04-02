import { getCookie } from '@utils/cookie';
import { errorBadRequest, errorForbidden, errorInternal, errorNotFound } from '@utils/error-msg';

export class Detail {
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

    static fromJSON(json: any): Detail {
        return new Detail(json.id, json.activity_id, json.name, json.maxPoints);
    }

    static fromJSONList(json: any): Detail[] {
        return json.map((item: any) => Detail.fromJSON(item));
    }

    static template(): Detail {
        return new Detail('', '', '', 0);
    }

    static list = async (activityId: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + activityId + '/detail');
        const json = await response.json();
        if (response.ok) {
            return json;
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
        activityId: string,
        data: {
            name: string;
            maxPoints: number;
        },
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(
            props.serverEndpoint + '/activity/' + activityId + '/detail/new',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: getCookie('token') || '',
                },
                body: JSON.stringify(data),
            }
        );
        const json = await response.json();

        if (response.ok) {
            return json;
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json['error']);
        }
    };

    static delete = async (activityId: string, detailId: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(
            props.serverEndpoint + '/activity/' + activityId + '/detail/' + detailId,
            {
                method: 'DELETE',
                headers: {
                    Authorization: getCookie('token') || '',
                },
            }
        );

        const json = await response.json();

        if (response.ok) {
            return json;
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json['error']);
        }
    };
}