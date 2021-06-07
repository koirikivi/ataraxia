import { Listener } from 'atvik';

import { ServiceEvent } from './ServiceEvent';
import { ServiceMethod } from './ServiceMethod';

/**
 * API for reflection on a service, allows for calling methods in a generic
 * way and also for inspecting methods and their arguments.
 */
export abstract class ServiceReflect {
	/**
	 * Identifier of the service this reflect is for.
	 */
	public readonly id: string;

	protected _methods: Map<string, ServiceMethod>;
	protected _events: Map<string, ServiceEvent>;

	protected constructor(
		id: string,
		methods: Map<string, ServiceMethod>,
		events: Map<string, ServiceEvent>,
	) {
		this.id = id;
		this._methods = methods;
		this._events = events;
	}

	/**
	 * Call a method on this service passing the arguments as an array.
	 *
	 * @param method -
	 *   the method to call
	 * @param args -
	 *   the arguments to pass to the method
	 * @returns
	 *   promise that resolves with the result of the call or rejects if an
	 *   error occurs
	 */
	public abstract apply(method: string, args: ReadonlyArray<any[]>): Promise<any>;

	/**
	 * Call a method on this service passing.
	 *
	 * @param method -
	 *   the method to call
	 * @param args -
	 *   the arguments to pass to the method
	 * @returns
	 *   promise that resolves with the result of the call or rejects if an
	 *   error occurs
	 */
	public call(method: string, ...args: ReadonlyArray<any[]>): Promise<any> {
		return this.apply(method, args);
	}

	/**
	 * Get the definition for the given method.
	 *
	 * @param name -
	 *   name of the method
	 * @returns
	 *   information about method if found, `null` otherwise
	 */
	public getMethod(name: string): ServiceMethod | null {
		return this._methods.get(name) || null;
	}

	/**
	 * Check if a certain method is available.
	 *
	 * @param name -
	 *   method to check
	 * @returns
	 *   `true` if the method is available
	 */
	public hasMethod(name: string): boolean {
		return this._methods.has(name);
	}

	/**
	 * Get methods available for this service.
	 *
	 * @returns
	 *   array with methods
	 */
	public get methods(): ServiceMethod[] {
		return [ ...this._methods.values() ];
	}

	/**
	 * Subscribe to an event.
	 *
	 * @param event -
	 *   name of event
	 * @param listener -
	 *   listener to subscribe
	 * @returns
	 *   promise that resolves when the listener is subscribed
	 */
	public abstract subscribe(event: string, listener: Listener<void, any[]>): Promise<void>;

	/**
	 * Unsubscribe from an event.
	 *
	 * @param event -
	 *   name of event
	 * @param listener -
	 *   listener to unsubscribe
	 * @returns
	 *   promise that resolves when the listener is unsubscribed
	 */
	public abstract unsubscribe(event: string, listener: Listener<void, any[]>): Promise<boolean>;

	/**
	 * Get information about an available event.
	 *
	 * @param name -
	 *   name of the event
	 * @returns
	 *   event if available or `null` if event doesn't exist
	 */
	public getEvent(name: string): ServiceEvent | null {
		return this._events.get(name) || null;
	}

	/**
	 * Get the definition for a specific event.
	 *
	 * @param name -
	 *   name of the event
	 * @returns
	 *   `true` if the event exists
	 */
	public hasEvent(name: string): boolean {
		return this._events.has(name);
	}

	/**
	 * Get the events available for this service.
	 *
	 * @returns
	 *   array with available events
	 */
	public get events(): ServiceEvent[] {
		return [ ...this._events.values() ];
	}
}
