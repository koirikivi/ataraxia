import { ServiceContract, stringType } from 'ataraxia-service-contracts';
import { TestNetwork } from 'ataraxia/test';

import { Services } from '../src/Services';

interface TestService {
	hello(what: string): Promise<string>;
}

const TestService = new ServiceContract<TestService>()
	.describeMethod('hello', {
		returnType: stringType,
		parameters: [
			{
				name: 'message',
				type: stringType
			}
		]
	});

describe('Services: Remote Calls', () => {
	it('Can call remote service via non-proxy', async () => {
		const testNetwork = new TestNetwork();
		testNetwork.bidirectional('a', 'b');

		const a = testNetwork.network('a');
		const b = testNetwork.network('b');

		const aServices = new Services(a);
		const bServices = new Services(b);

		await aServices.join();
		await bServices.join();

		aServices.register('test', TestService.implement({
			async hello(what: string) {
				return 'Hello ' + what + '!';
			}
		}));

		await testNetwork.consolidate();

		const helloService = bServices.get('test');
		if(helloService.available) {
			try {
				const s = await helloService.call('hello', 'world');
				expect(s).toBe('Hello world!');
			} finally {
				await aServices.leave();
				await bServices.leave();

				await testNetwork.shutdown();
			}
			return;
		}

		await aServices.leave();
		await bServices.leave();
		await testNetwork.shutdown();
		throw new Error('Service not found');
	});

	it('Can call remote service via proxy', async () => {
		const testNetwork = new TestNetwork();
		testNetwork.bidirectional('a', 'b');

		const a = testNetwork.network('a');
		const b = testNetwork.network('b');

		const aServices = new Services(a);
		const bServices = new Services(b);

		await aServices.join();
		await bServices.join();

		aServices.register('test', TestService.implement({
			async hello(what: string) {
				return 'Hello ' + what + '!';
			}
		}));

		await testNetwork.consolidate();

		const helloService = bServices.get('test');
		if(helloService.available) {
			try {
				const proxy = helloService.as(TestService);
				const s = await proxy.hello('world');
				expect(s).toBe('Hello world!');
			} finally {
				await aServices.leave();
				await bServices.leave();

				await testNetwork.shutdown();
			}
			return;
		}

		await aServices.leave();
		await bServices.leave();
		await testNetwork.shutdown();
		throw new Error('Service not found');
	});
});
